"use client";
import { useState, useEffect, useMemo, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Clock, ArrowLeft, MailOpen, Edit3, Lock, ShieldCheck, Check, X, Mail } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useGoogleMaps } from "@/components/GoogleMapProvider";
import MapPolyline from "@/components/MapPolyline";
import MapBoundsFitter from "@/components/MapBoundsFitter";
import { supabase } from "@/lib/supabase";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function RastreioPage({ params }: { params: Promise<{ id: string }> }) {
  const { isLoaded } = useGoogleMaps();
  const resolvedParams = use(params);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [letterContent, setLetterContent] = useState("");

  // Estado da Carta Real do DB
  const [letter, setLetter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLetter() {
      const { id } = await resolvedParams;
      const { data, error } = await supabase
        .from("letters")
        .select("*, birds(name, speed_kmh, image_url)")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        setLetter(data);
        setLetterContent(data.content);
      }
      setLoading(false);
    }
    fetchLetter();
  }, [resolvedParams]);

  // Simulação de Progresso do Pássaro no Mapa
  // Cálculo de Progresso e Tempo Restante baseados no DB
  const [tempoRestante, setTempoRestante] = useState("Calculando...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!letter || !letter.eta_timestamp || !letter.created_at) return;

    const timer = setInterval(() => {
      const agora = new Date().getTime();
      const chegada = new Date(letter.eta_timestamp).getTime();
      const partida = new Date(letter.created_at).getTime();
      const diff = chegada - agora;

      // Calcular o percentual de progresso
      const totalDuration = chegada - partida;
      const elapsed = agora - partida;
      if (totalDuration > 0) {
        let pct = (elapsed / totalDuration) * 100;
        if (pct > 100) pct = 100;
        if (pct < 0) pct = 0;
        setProgress(pct);
      } else {
        setProgress(100);
      }

      if (diff <= 0) {
        setTempoRestante("00:00:00");
        setProgress(100);
        clearInterval(timer);
        
        // Finalização Automática de Entrega no Banco
        if (letter.status === "in_transit") {
          const finalizarEntrega = async () => {
            const { error } = await supabase
              .from("letters")
              .update({ status: "delivered" })
              .eq("id", letter.id);
            
            if (!error) {
              console.log("Carta entregue com sucesso no banco!");
              window.location.reload(); // Recarrega para exibir a "Static Arrival View"
            }
          };
          finalizarEntrega();
        }
      } else {
        const horas = Math.floor(diff / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diff % (1000 * 60)) / 1000);
        setTempoRestante(
          [horas, minutos, segundos]
            .map((v) => String(v).padStart(2, "0"))
            .join(":")
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [letter?.eta_timestamp, letter?.created_at]);

  // Cálculo da posição do pássaro na curva geodésica
  const birdPosition = useMemo(() => {
    if (!isLoaded || !window.google || !letter) return null;
    const p1 = new window.google.maps.LatLng(letter.origin_lat, letter.origin_lng);
    const p2 = new window.google.maps.LatLng(letter.dest_lat, letter.dest_lng);
    const fraction = progress / 100;
    const interpolated = window.google.maps.geometry.spherical.interpolate(p1, p2, fraction);
    return { lat: interpolated.lat(), lng: interpolated.lng() };
  }, [progress, isLoaded, letter]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-stone-100"><div className="text-zinc-500 font-semibold text-sm">Aguardando coordenadas...</div></div>;
  }

  if (!letter) {
    return <div className="h-screen w-full flex items-center justify-center bg-stone-100"><div className="text-zinc-500 font-semibold text-sm">Carta não encontrada.</div></div>;
  }

  // Ação de validação pedida pelo usuário:
  console.log("📍 Coordenadas de Destino do Banco:", letter.dest_lat, letter.dest_lng);

  return (
    <div className="h-screen w-full relative overflow-hidden bg-stone-100 font-sans">
      
      {/* ── MAPA EM TEMPO REAL OU VIEW ESTÁTICA ───────────────── */}
      <div className="absolute inset-0 w-full h-full z-0 bg-[#E8ECEF] flex items-center justify-center">
        {letter.status === "in_transit" ? (
          isLoaded ? (
            <Map
            mapId="DEMO_MAP_ID"
            disableDefaultUI={true}
            keyboardShortcuts={false}
            gestureHandling="greedy"
            styles={[
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
              },
              {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
              },
              {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
              },
              {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
              },
              {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
              },
              {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
              },
              {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
              },
            ]}
          >
            <MapBoundsFitter 
              points={[
                { lat: letter.origin_lat, lng: letter.origin_lng },
                { lat: letter.dest_lat, lng: letter.dest_lng }
              ]} 
            />

            {/* Traçado principal do Voo */}
            <MapPolyline
              path={[
                { lat: letter.origin_lat, lng: letter.origin_lng },
                { lat: letter.dest_lat, lng: letter.dest_lng },
              ]}
              strokeColor="#4b5563"
              strokeOpacity={0.5}
              strokeWeight={2}
              geodesic={true}
            />

            {/* Rota percorrida (linha sólida) */}
            {birdPosition && (
              <MapPolyline
                path={[
                  { lat: letter.origin_lat, lng: letter.origin_lng },
                  birdPosition,
                ]}
                strokeColor="#10b981"
                strokeOpacity={1}
                strokeWeight={3}
                geodesic={true}
              />
            )}

            {/* Marcadores Origem e Destino com AdvancedMarker */}
            <AdvancedMarker position={{ lat: letter.origin_lat, lng: letter.origin_lng }}>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md"></div>
                <div className="mt-1 bg-zinc-900/80 px-2 py-1 text-[10px] text-white rounded shadow-sm whitespace-nowrap">
                  {letter.origin_name?.substring(0, 30) || "Origem"}
                </div>
              </div>
            </AdvancedMarker>

            <AdvancedMarker position={{ lat: letter.dest_lat, lng: letter.dest_lng }}>
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md"></div>
                <div className="mt-1 bg-zinc-900/80 px-2 py-1 text-[10px] text-white rounded shadow-sm whitespace-nowrap">
                  {letter.destination_name?.substring(0, 30) || "Destino"}
                </div>
              </div>
            </AdvancedMarker>

            {/* Ave Marcador Dinâmico */}
            {birdPosition && (
              <AdvancedMarker position={birdPosition} zIndex={100}>
                <div className="bg-white p-2 rounded-full shadow-lg border border-zinc-100 flex items-center justify-center relative -translate-y-4">
                   <img src={letter.birds?.image_url || "/owl.png"} alt={letter.birds?.name || "Ave"} className="w-8 h-8 object-contain" />
                </div>
              </AdvancedMarker>
            )}
          </Map>
          ) : (
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
            <div className="relative text-center p-10 bg-white/70 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/40 max-w-sm mx-4">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border border-emerald-500/20">
                <MailOpen className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-zinc-900 mb-3">Missão Cumprida</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Esta correspondência já foi entregue ao seu destino e a ave retornou em segurança ao painel.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTÃO VOLTAR & CONTROLES CHEAT ──────────────────────────────────── */}
      <div className="absolute top-6 left-6 z-30 flex items-center gap-4">
        <Link href="/painel" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md border border-zinc-200/60 rounded-full text-zinc-700 hover:text-zinc-950 transition-all font-semibold text-xs shadow-sm hover:shadow">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Painel</span>
        </Link>
        
        {/* Toggle para simular Apoio (UX Helper) */}
        <button
          type="button"
          onClick={() => {
            setIsPremium((prev) => !prev);
            setIsEditing(false);
          }}
          className={clsx(
            "flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold shadow-sm transition-all cursor-pointer",
            isPremium
              ? "bg-amber-500/10 border-amber-500/20 text-amber-700"
              : "bg-white/90 border-zinc-200/60 text-zinc-500 hover:text-zinc-750"
          )}
        >
          {isPremium ? "✨ Apoio Ativo" : "🔒 Sem Apoio (Simular)"}
        </button>
      </div>

      {/* ── HUD / PAINEL FLUTUANTE (Liquid Glass) ───────────────────────────── */}
      <div className="absolute bottom-8 left-8 z-30 max-w-sm w-[calc(100%-4rem)]">
        <div className="bg-white/95 shadow-2xl rounded-3xl p-6 border border-zinc-200/40 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
              Carta em voo
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">
              {progress.toFixed(0)}% percorrido
            </span>
          </div>

          <div className="flex items-center justify-between border-y border-zinc-200/40 py-4 gap-4">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div>
                <p className="text-xs font-semibold text-zinc-500">Destinatário</p>
                <p className="text-lg font-bold text-zinc-900 truncate">{letter.recipient_name || letter.recipient_contact}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-650">
                <span className="font-semibold text-zinc-800">De:</span> 
                <span className="truncate" title={letter.origin_name}>{letter.origin_name?.substring(0, 30)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-650">
                <span className="font-semibold text-zinc-800">Para:</span> 
                <span className="truncate" title={letter.destination_name}>{letter.destination_name?.substring(0, 30)}</span>
              </div>
              <div className="pt-1 text-xs text-zinc-650 font-medium">
                Pássaro: {letter.birds?.name} ({letter.birds?.speed_kmh} km/h)
              </div>
              <div className="text-xs text-zinc-500">
                Despachado em: {formatDate(letter.created_at)}
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setIsLetterModalOpen(true)}
              className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center shadow transition-colors shrink-0 cursor-pointer"
              title="Ver pergaminho"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-600">Chegada em</span>
            </div>
            <span className="font-mono text-xl font-bold text-zinc-900 tracking-tight">
              {tempoRestante}
            </span>
          </div>
        </div>
      </div>

      {/* ── MODAL DE LEITURA E EDIÇÃO (Premium) ────────────────────────────── */}
      <AnimatePresence>
        {isLetterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsLetterModalOpen(false);
                setIsEditing(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="bg-white border border-zinc-100 rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-500">
                  <MailOpen className="w-5 h-5 text-zinc-400" />
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-zinc-900 leading-tight">Pergaminho em Voo</h3>
                    <p className="text-xs text-zinc-400">Verifique o conteúdo da carta despachada</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLetterModalOpen(false);
                    setIsEditing(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 md:p-8 flex-1">
                {isEditing ? (
                  <textarea
                    rows={6}
                    value={letterContent}
                    onChange={(e) => setLetterContent(e.target.value)}
                    className="font-handwriting w-full bg-stone-50 rounded-2xl px-6 py-6 text-xl text-zinc-900 placeholder:text-zinc-400 outline-none border border-zinc-200 focus:border-zinc-300 transition resize-none"
                  />
                ) : (
                  <div className="relative bg-[#FCFAF6] border border-[#eaddc3] rounded-2xl p-8 text-zinc-800 min-h-[160px]">
                    <div className="absolute inset-0 opacity-15 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')] rounded-2xl pointer-events-none" />
                    <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(139,69,19,0.05)] rounded-2xl pointer-events-none" />
                    
                    <p className="font-handwriting text-xl leading-relaxed text-zinc-800 relative z-10 whitespace-pre-wrap break-words">
                      {letterContent}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer (Premium Control / Paywall) */}
              <div className="p-6 border-t border-zinc-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {isPremium ? (
                  // Fluxo PRO / Premium ativo
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Edição Liberada (Apoiador)</span>
                    </div>

                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-zinc-900 text-white text-xs font-semibold tracking-wider uppercase px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        Salvar Alterações
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="bg-zinc-900 text-white text-xs font-semibold tracking-wider uppercase px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        Editar Carta
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  // Fluxo Gratuito com Paywall bloqueado
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-[280px]">
                      ✨ Torne-se um Apoiador para alterar o conteúdo de cartas em voo
                    </p>
                    <button
                      type="button"
                      disabled
                      className="bg-zinc-200 text-zinc-400 text-[10px] font-bold tracking-wider uppercase px-4 py-2.5 rounded-full inline-flex items-center gap-1.5 cursor-not-allowed shrink-0 border border-zinc-300/30"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Bloqueado
                    </button>
                  </div>
                )}
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
