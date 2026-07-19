"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import PillNav from "@/components/PillNav";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Mail,
  Phone,
  Lock,
  Check,
  Send,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Bird as BirdIcon,
  Moon,
  Zap,
  Wind,
  Paperclip,
  Mic,
  MicOff,
  Clock,
  Route,
  Image as ImageIcon,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Map, useMap } from "@vis.gl/react-google-maps";
import { useGoogleMaps } from "@/components/GoogleMapProvider";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import MapPolyline from "@/components/MapPolyline";
import MapBoundsFitter from "@/components/MapBoundsFitter";

// ─── Tipos e Configurações ──────────────────────────────────────────────────
interface Bird {
  id: string;
  name: string;
  speedKmh: number;
  speedLabel: string;
  icon: React.ComponentType<any>;
  tagline: string;
  isPro: boolean;
  payload: string;
  supportsPhoto: boolean;
  supportsAudio: boolean;
  image: string;
}

const BIRD_UI_METADATA: Record<string, { icon: any; tagline: string }> = {
  "Pombo Correio": { icon: BirdIcon, tagline: "O clássico. Confiável, um pouco lento, mas nunca falha." },
  "Falcão Peregrino": { icon: Wind, tagline: "Veloz e elegante. Para quando a urgência exige velocidade máxima." },
  "Coruja Noturna": { icon: Moon, tagline: "Voa em silêncio. Ideal para mensagens enviadas ao anoitecer." },
  "Águia Imperial": { icon: Zap, tagline: "Forte e imponente. Resistente contra as piores tempestades." },
};



function haversineDistance(c1: { lat: number; lng: number }, c2: { lat: number; lng: number }): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(c2.lat - c1.lat);
  const dLng = toRad(c2.lng - c1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(c1.lat)) *
      Math.cos(toRad(c2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatETA(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutesAfterDays = totalMinutes % (24 * 60);
  const hrs = Math.floor(remainingMinutesAfterDays / 60);
  const mins = remainingMinutesAfterDays % 60;
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} dia${days !== 1 ? "s" : ""}`);
  if (hrs > 0) parts.push(`${hrs} hora${hrs !== 1 ? "s" : ""}`);
  if (mins > 0 || parts.length === 0) parts.push(`${mins} minuto${mins !== 1 ? "s" : ""}`);
  
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts[0]}, ${parts[1]} e ${parts[2]}`;
}

// ─── Componente Principal (Wizard) ──────────────────────────────────────────
export default function DespacharPage() {
  const router = useRouter();
  const { isLoaded } = useGoogleMaps();
  const [currentStep, setCurrentStep] = useState(1);
  const [origin, setOrigin] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [notifyMethod, setNotifyMethod] = useState<"email" | "whatsapp">("email");
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [selectedBird, setSelectedBird] = useState<string>("");
  const [message, setMessage] = useState("");
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loadingBirds, setLoadingBirds] = useState(true);

  // Estados de Mock
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success">("idle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Recording Mock
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);
  const recordingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Attach Mock
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);



  // Carrega catálogo de aves do Supabase e dados do perfil para preenchimento padrão
  useEffect(() => {
    async function initData() {
      try {
        const { data: birdsData, error: birdsError } = await supabase
          .from("birds")
          .select("*")
          .order("speed_kmh", { ascending: true });
        if (birdsError) throw birdsError;
        if (birdsData) {
          const mapped = birdsData.map((b) => ({
            id: b.id,
            name: b.name,
            speedKmh: b.speed_kmh,
            speedLabel: `${b.speed_kmh} km/h`,
            icon: BIRD_UI_METADATA[b.name]?.icon || BirdIcon,
            tagline: BIRD_UI_METADATA[b.name]?.tagline || "Mensageiro ágil pronto para decolar.",
            isPro: b.is_premium,
            payload: b.payload_limit,
            supportsPhoto: b.supports_photo,
            supportsAudio: b.supports_audio,
            image: b.image_url,
          }));
          setBirds(mapped);
          if (mapped.length > 0) {
            setSelectedBird(mapped[0].id);
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("default_address, default_lat, default_lng, phone_number")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            if (profile.default_address && profile.default_lat && profile.default_lng) {
              setOrigin({ 
                address: profile.default_address, 
                lat: profile.default_lat, 
                lng: profile.default_lng 
              });
            }
            if (profile.phone_number) {
              setRecipient(profile.phone_number);
              setNotifyMethod("whatsapp");
            }
          }
        }
      } catch (err) {
        console.error("Erro na inicialização dos dados:", err);
      } finally {
        setLoadingBirds(false);
      }
    }
    initData();
  }, []);

  const activeBird = birds.find((b) => b.id === selectedBird) || birds[0] || {
    id: "",
    name: "Aguardando...",
    speedKmh: 80,
    speedLabel: "80 km/h",
    tagline: "",
    isPro: false,
    payload: "",
    supportsPhoto: false,
    supportsAudio: false,
    image: "/pigeon.png"
  };

  // ETA Dinâmico
  const eta = useMemo(() => {
    if (!origin || !destination || !activeBird.id) return null;
    const dist = haversineDistance(origin, destination);
    const hours = dist / activeBird.speedKmh;
    return { distance: dist, hours, formatted: formatETA(hours) };
  }, [origin, destination, activeBird]);

  // Limpa anexos não suportados se a ave mudar
  useEffect(() => {
    if (!activeBird.id) return;
    if (!activeBird.supportsPhoto) {
      setAttachedFiles([]);
    }
    if (!activeBird.supportsAudio) {
      setHasAudio(false);
      setIsRecording(false);
      if (recordingRef.current) clearInterval(recordingRef.current);
    }
  }, [selectedBird, activeBird]);

  // Handlers

  function handleAttach() {
    if (!activeBird.supportsPhoto) return;
    const mockName = `foto_${attachedFiles.length + 1}.jpg`;
    setAttachedFiles((prev) => [...prev, mockName]);
  }

  function handleToggleRecording() {
    if (!activeBird.supportsAudio) return;
    if (isRecording) {
      setIsRecording(false);
      setHasAudio(true);
      if (recordingRef.current) clearInterval(recordingRef.current);
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      recordingRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  }

  function handleNext() {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!origin || !destination || !recipient.trim() || !recipientName.trim()) {
        setToastMessage("Por favor, defina a origem, destino, nome e contato do destinatário.");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!message.trim()) {
        setToastMessage("Sua carta precisa ter uma mensagem escrita.");
        return;
      }
      setCurrentStep(4);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  async function handleSubmit() {
    setSubmitStatus("loading");
    setToastMessage(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Usuário não autenticado. Por favor, faça login novamente.");
      }

      const c1 = origin;
      const c2 = destination;
      if (!c1 || !c2) {
        throw new Error("Não foi possível resolver as coordenadas geográficas para a rota informada.");
      }

      const dist = haversineDistance(c1, c2);
      const hours = dist / activeBird.speedKmh;
      const etaTimestamp = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

      const dadosDaCarta = {
        sender_id: user.id,
        bird_id: selectedBird,
        recipient_name: recipientName || recipient.split("@")[0] || "Destinatário",

        recipient_contact: recipient,
        notification_method: notifyMethod,
        content: message,
        origin_name: origin.address,
        origin_lat: c1.lat,
        origin_lng: c1.lng,
        destination_name: destination.address,
        dest_lat: c2.lat,
        dest_lng: c2.lng,
        distance_km: dist,
        eta_timestamp: etaTimestamp
      };

      console.log("Iniciando despacho com dados:", dadosDaCarta);

      const { data, error } = await supabase
        .from('letters')
        .insert([
          {
            sender_id: dadosDaCarta.sender_id, // UUID do usuário autenticado
            bird_id: dadosDaCarta.bird_id,
            recipient_name: dadosDaCarta.recipient_name,
            recipient_contact: dadosDaCarta.recipient_contact,
            notification_method: dadosDaCarta.notification_method,
            content: dadosDaCarta.content,
            origin_name: dadosDaCarta.origin_name,
            origin_lat: Number(dadosDaCarta.origin_lat), // Forçando conversão numérica
            origin_lng: Number(dadosDaCarta.origin_lng),
            destination_name: dadosDaCarta.destination_name,
            dest_lat: Number(dadosDaCarta.dest_lat),
            dest_lng: Number(dadosDaCarta.dest_lng),
            status: 'in_transit',
            distance_km: Number(dadosDaCarta.distance_km),
            eta_timestamp: dadosDaCarta.eta_timestamp
          }
        ]);

      if (error) {
        console.error("❌ ERRO FATAL AO SALVAR CARTA:");
        console.error("Mensagem:", error.message);
        console.error("Detalhes:", error.details); // Isso revela violações de RLS ou constraints
        console.error("Dica:", error.hint);
        throw new Error(`Erro Supabase: ${error.message} - ${error.details || ""}`);
      }

      console.log("✅ Carta despachada com sucesso!", data);
      setSubmitStatus("success");
    } catch (err: any) {
      console.error(err);
      setToastMessage(err.message || "Erro desconhecido ao despachar a carta.");
      setSubmitStatus("idle");
    }
  }

  function handleReset() {
    setOrigin(null);
    setDestination(null);
    setRecipient("");
    setMessage("");
    setSelectedBird("pombo");
    setHasAudio(false);
    setAttachedFiles([]);
    setSubmitStatus("idle");
    setCurrentStep(1);
  }

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const stepVariants = {
    initial: { x: 20 },
    animate: { x: 0 },
    exit: { x: -20 },
  };

  // ── Renderização da Tela de Sucesso ───────────────────────────────────────
  if (submitStatus === "success") {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-zinc-100 rounded-3xl p-10 max-w-md w-full shadow-sm text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-zinc-900 leading-tight">
            Carta despachada!
          </h1>
          <p className="text-zinc-655 text-xs leading-relaxed">
            Sua correspondência foi selada e entregue ao mensageiro. O destinatário acabou de ser notificado.
          </p>
          <div className="flex flex-col gap-3 w-full mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="w-full bg-zinc-900 text-white py-3.5 px-6 rounded-full font-medium text-xs hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            >
              Enviar outra carta
            </button>
            <button
              type="button"
              onClick={() => router.push("/painel")}
              className="w-full bg-transparent border border-zinc-200 text-zinc-600 py-3.5 px-6 rounded-full font-medium text-xs hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Ir para o meu Painel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-24">
      <PillNav />

      {/* Toast de Validação */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="p-4 rounded-2xl shadow-lg border border-amber-200 text-xs flex gap-3 items-start bg-amber-50 text-amber-800"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Atenção</p>
              <p className="mt-0.5 text-zinc-650">{toastMessage}</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Page Header */}
      <header className="flex flex-col items-center justify-center text-center pt-36 pb-10 px-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 border border-zinc-200 rounded-full px-3.5 py-1 mb-6 tracking-wider uppercase bg-white shadow-xs">
          Passo {currentStep} de 4
        </span>
        <h1 className="font-serif text-5xl font-semibold leading-tight tracking-tight text-zinc-900">
          Despachar uma <em>carta</em>
        </h1>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 transition-all duration-300">
        
        {/* Step Visualizer */}
        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={clsx(
                "h-1 rounded-full transition-all duration-300",
                step <= currentStep ? "w-8 bg-zinc-900" : "w-4 bg-zinc-200"
              )}
            />
          ))}
        </div>

        {/* Wizard Card Wrapper */}
        <div className="bg-white shadow-sm border border-zinc-100 rounded-3xl p-8 min-h-[420px] flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {/* ── PASSO 1: Escolha do Mensageiro ────────────────────────── */}
              {currentStep === 1 && (
                <div className="space-y-6 relative">
                  {/* Gradientes radiais / Blobs decorativos em posição absoluta para destacar o efeito Glassmorphism */}
                  <div className="absolute top-[65%] left-1/4 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-0" />
                  <div className="absolute bottom-12 right-1/4 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0" />

                  <div className="relative z-10">
                    <h2 className="font-serif text-2xl font-semibold text-zinc-900">Escolha o Mensageiro</h2>
                    <p className="text-xs text-zinc-650 mt-1">
                      As aves diferem em velocidade e capacidade de arquivos adicionais.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                    {loadingBirds ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-[420px] rounded-3xl bg-[#F4F5F6] animate-pulse relative overflow-hidden p-6 flex flex-col justify-between border border-transparent shadow-xs"
                        >
                          <div className="flex-1 w-full flex items-center justify-center pt-4 pb-20">
                            <div className="w-32 h-32 rounded-full bg-zinc-200/50" />
                          </div>
                          <div className="bg-zinc-200/50 rounded-2xl h-20 w-full p-4 flex flex-col gap-2">
                            <div className="h-4 bg-zinc-300/60 rounded-md w-3/4" />
                            <div className="h-3 bg-zinc-300/40 rounded-md w-1/2 mt-1" />
                          </div>
                        </div>
                      ))
                    ) : (
                      birds.map((bird) => {
                        const isActive = selectedBird === bird.id;
                        return (
                          <motion.button
                            key={bird.id}
                            id={`bird-${bird.id}`}
                            type="button"
                            onClick={() => setSelectedBird(bird.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={clsx(
                              "h-[420px] relative overflow-hidden rounded-3xl group cursor-pointer border border-transparent text-left w-full flex flex-col justify-between shadow-xs select-none",
                              isActive
                                ? "bg-zinc-900 text-white ring-4 ring-zinc-900 ring-offset-4 ring-offset-stone-50"
                                : "bg-[#F4F5F6] text-zinc-800"
                            )}
                          >
                            {/* Efeito 3D Levitação da ave */}
                            <div className="flex-1 w-full flex items-center justify-center relative min-h-0 pt-4 pb-20">
                              {/* Imagem da Ave */}
                              <img
                                src={bird.image}
                                alt={bird.name}
                                className="h-44 w-auto object-contain select-none pointer-events-none transform group-hover:scale-110 group-hover:-translate-y-4 transition-transform duration-700 ease-out"
                              />
                            </div>

                            {/* Painel de Informações Integrado (Evita nested cards) */}
                            <div
                              className={clsx(
                                "absolute bottom-0 inset-x-0 p-5 z-20 border-t rounded-b-3xl transition-all duration-300 select-none",
                                isActive
                                  ? "bg-black/35 backdrop-blur-md border-white/10 text-white"
                                  : "bg-stone-100 border-zinc-200/60 text-zinc-800"
                              )}
                            >
                              <h3 className="font-serif font-semibold text-base leading-tight tracking-tight">
                                {bird.name}
                              </h3>
                              <div className="flex items-center justify-between mt-1">
                                <span className={clsx("text-[10px] font-medium", isActive ? "text-zinc-300" : "text-zinc-500")}>
                                  {bird.speedLabel}
                                </span>
                                <span className={clsx("text-[10px] font-medium", isActive ? "text-zinc-300" : "text-zinc-500")}>
                                  {bird.payload}
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </div>

                  <div className="flex justify-between items-center gap-4 border-l-2 border-zinc-250 pl-4 py-1.5 mt-4 relative z-10">
                    <p className="text-xs text-zinc-650 italic">&ldquo;{activeBird.tagline}&rdquo;</p>
                    {activeBird.isPro && (
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-md shrink-0">
                        Apoiador
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ── PASSO 2: Rota e Destinatário ─────────────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-zinc-900">Rota e Notificação</h2>
                    <p className="text-xs text-zinc-600 mt-1">
                      Defina os detalhes logísticos da viagem do seu mensageiro.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Coluna Esquerda: Formulário */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="destination" className="block text-xs font-semibold text-zinc-700">Destino (Endereço completo)</label>
                          {isLoaded ? (
                            <PlaceAutocomplete
                              id="destination"
                              placeholder="Endereço no Brasil..."
                              defaultValue={destination?.address || ""}
                              onPlaceSelect={setDestination}
                              className="w-full bg-stone-50 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 border border-zinc-100 transition"
                            />
                          ) : (
                            <input
                              disabled
                              type="text"
                              placeholder="Carregando mapa..."
                              className="w-full bg-stone-50/50 rounded-xl px-4 py-3 text-xs text-zinc-900 outline-none border border-zinc-100"
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 border-t border-zinc-100 pt-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-zinc-700">Notificar destinatário por</label>
                          <div className="inline-flex p-1 bg-zinc-100 rounded-full">
                            <button
                              type="button"
                              onClick={() => { setNotifyMethod("email"); setRecipient(""); }}
                              className={clsx(
                                "flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer",
                                notifyMethod === "email" ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                              )}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              E-mail
                            </button>
                            <button
                              type="button"
                              onClick={() => { setNotifyMethod("whatsapp"); setRecipient(""); }}
                              className={clsx(
                                "flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer",
                                notifyMethod === "whatsapp" ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                              )}
                            >
                              <Phone className="w-3.5 h-3.5" />
                              WhatsApp
                            </button>
                          </div>
                        </div>

                        {/* Nome do Destinatário */}
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 mb-2">
                            Nome do Destinatário
                          </label>
                          <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Ex: João Silva"
                            className="w-full bg-stone-50 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 border border-zinc-100 transition"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="recipient" className="block text-xs font-semibold text-zinc-700">
                            {notifyMethod === "email" ? "E-mail do destinatário" : "WhatsApp do destinatário"}
                          </label>
                          <input
                            id="recipient"
                            type={notifyMethod === "email" ? "email" : "tel"}
                            placeholder={notifyMethod === "email" ? "amigo@exemplo.com" : "+55 (43) 99999-9999"}
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full bg-stone-50 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 border border-zinc-100 transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Coluna Direita: Mapa & Dashboard */}
                    <div className="space-y-4 flex flex-col justify-between">
                      {/* Container do Mapa */}
                      <div className="h-64 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/50 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-75" />
                        {eta && origin && destination && isLoaded ? (
                          <div className="w-full h-full absolute inset-0 z-10">
                            <Map
                              disableDefaultUI={true}
                              keyboardShortcuts={false}
                              gestureHandling="none"
                              styles={[
                                { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
                                { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                                { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
                                { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
                                { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
                                { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
                                { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                                { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
                                { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                                { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
                                { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
                                { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
                                { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
                                { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
                                { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
                                { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
                              ]}
                            >
                              <MapBoundsFitter 
                                points={[
                                  { lat: origin.lat, lng: origin.lng },
                                  { lat: destination.lat, lng: destination.lng }
                                ]} 
                              />
                              <MapPolyline
                                path={[
                                  { lat: origin.lat, lng: origin.lng },
                                  { lat: destination.lat, lng: destination.lng }
                                ]}
                                strokeColor="#18181b"
                                strokeOpacity={0.8}
                                strokeWeight={3}
                                geodesic={true}
                              />
                            </Map>
                          </div>
                        ) : (
                          <div className="text-center p-6 z-10">
                            <Route className="w-8 h-8 text-zinc-400 mx-auto mb-2 stroke-1" />
                            <span className="text-xs text-zinc-400 font-medium">Aguardando rota...</span>
                          </div>
                        )}
                      </div>

                      {/* Painel de ETA */}
                      {eta ? (
                        <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-lg space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Distância Total</span>
                            <span className="font-serif text-lg font-semibold">{eta.distance.toFixed(1)} km</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Tempo de Voo</span>
                            <span className="font-semibold">{eta.formatted}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 justify-end">
                            <Clock className="w-3.5 h-3.5" />
                            Calculado via {activeBird.name} ({activeBird.speedLabel})
                          </div>
                        </div>
                      ) : (
                        <div className="bg-zinc-100 text-zinc-500 rounded-2xl p-6 text-center text-xs font-medium border border-dashed border-zinc-200 py-12">
                          Preencha a rota para calcular o tempo de voo.
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* ── PASSO 3: O Pergaminho (Mensagem) ──────────────────────── */}
              {currentStep === 3 && (
                <div className="space-y-6 flex flex-col h-full">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-zinc-900">O Pergaminho</h2>
                    <p className="text-xs text-zinc-600 mt-1">
                      Escreva a sua carta. Formatos adicionais serão habilitados conforme a ave escolhida.
                    </p>
                  </div>

                  <div className="relative flex-1">
                    <textarea
                      id="message"
                      rows={7}
                      placeholder="Comece a escrever sua correspondência..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="font-handwriting w-full bg-stone-50/50 rounded-2xl px-6 py-6 text-lg text-zinc-900 placeholder:text-zinc-400 outline-none border border-transparent focus:border-zinc-200/60 transition resize-none"
                    />

                    {/* Action Bar */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1">
                      <span className="text-xs text-zinc-400 select-none mr-2">
                        {message.length}
                      </span>

                      {/* Attach Botão */}
                      <button
                        type="button"
                        onClick={handleAttach}
                        disabled={!activeBird.supportsPhoto}
                        className={clsx(
                          "p-2 rounded-lg transition-colors cursor-pointer",
                          activeBird.supportsPhoto
                            ? "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                            : "text-zinc-200 cursor-not-allowed"
                        )}
                        title={activeBird.supportsPhoto ? "Anexar foto" : "Esta ave não suporta anexo de fotos"}
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      {/* Audio Botão */}
                      <button
                        type="button"
                        onClick={handleToggleRecording}
                        disabled={!activeBird.supportsAudio}
                        className={clsx(
                          "p-2 rounded-lg transition-colors cursor-pointer",
                          activeBird.supportsAudio
                            ? isRecording
                              ? "text-red-500 bg-red-50 hover:bg-red-100"
                              : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                            : "text-zinc-200 cursor-not-allowed"
                        )}
                        title={
                          activeBird.supportsAudio
                            ? isRecording ? "Parar gravação" : "Gravar áudio"
                            : "Esta ave não suporta anexo de áudio"
                        }
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      {isRecording && (
                        <span className="flex items-center gap-1 text-xs font-mono text-red-500 ml-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          {formatRecTime(recordingTime)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Previews de anexo */}
                  {(attachedFiles.length > 0 || hasAudio) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {attachedFiles.map((file, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-1.5"
                        >
                          <ImageIcon className="w-3 h-3" />
                          {file}
                        </span>
                      ))}
                      {hasAudio && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-1.5">
                          <Mic className="w-3 h-3" />
                          Áudio gravado
                        </span>
                      )}
                    </div>
                  )}

                  {!activeBird.supportsPhoto && !activeBird.supportsAudio && (
                    <p className="text-[11px] text-zinc-400">
                      * O Pombo Correio é exclusivo para texto. Para fotos ou áudio, mude a ave no Passo 1.
                    </p>
                  )}
                </div>
              )}

              {/* ── PASSO 4: Revisão e Despacho ──────────────────────────── */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-zinc-900">Revisão do Despacho</h2>
                    <p className="text-xs text-zinc-650 mt-1">
                      Confirme os dados antes de selar o pergaminho e enviar a ave.
                    </p>
                  </div>

                  <div className="border border-zinc-100 rounded-2xl p-6 space-y-4 text-xs bg-stone-50/50">
                    <div className="flex justify-between border-b border-zinc-100 pb-3">
                      <span className="text-zinc-500 font-medium">Mensageiro</span>
                      <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <BirdIcon className="w-3.5 h-3.5" />
                        {activeBird.name} ({activeBird.speedLabel})
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-3">
                      <span className="text-zinc-500 font-medium">Origem</span>
                      <span className="font-semibold text-zinc-900">{origin?.address}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-3">
                      <span className="text-zinc-500 font-medium">Destino</span>
                      <span className="font-semibold text-zinc-900">{destination?.address}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-3">
                      <span className="text-zinc-500 font-medium">Notificar via</span>
                      <span className="font-semibold text-zinc-900 uppercase">{notifyMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-medium">Destinatário</span>
                      <span className="font-semibold text-zinc-900 break-all">{recipient}</span>
                    </div>
                  </div>

                  {/* Painel de ETA Dinâmico */}
                  {eta && (
                    <div className="bg-zinc-100 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-zinc-700 shadow-xs shrink-0">
                          <Route className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-900">
                            Distância:{" "}
                            <span className="font-mono">{eta.distance.toLocaleString("pt-BR")} km</span>
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">Tempo estimado de voo</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-xs border border-zinc-200/60 font-semibold text-zinc-900 text-xs">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        {eta.formatted}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Wizard Navigation Controls ────────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-6 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || submitStatus === "loading"}
              className={clsx(
                "inline-flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer",
                currentStep === 1 || submitStatus === "loading"
                  ? "text-zinc-300 cursor-not-allowed"
                  : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-zinc-900 text-white text-xs font-semibold tracking-wider uppercase px-6 py-3 rounded-full hover:bg-zinc-800 transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                Avançar
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="submit-despachar"
                type="button"
                onClick={handleSubmit}
                disabled={submitStatus === "loading"}
                className="bg-zinc-900 text-white text-xs font-semibold tracking-wider uppercase px-8 py-3.5 rounded-full hover:bg-zinc-800 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitStatus === "loading" ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Enviando ave...
                  </>
                ) : (
                  <>
                    Despachar Carta
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

const formatRecTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
