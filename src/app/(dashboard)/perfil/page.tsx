"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getTierDisplayName } from "@/lib/limits";
import PillNav from "@/components/PillNav";
import AvatarEditor from "@/components/AvatarEditor";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import { useGoogleMaps } from "@/components/GoogleMapProvider";
import { User, Shield, CheckCircle2, Loader, AtSign, Phone, MapPin, Camera, Save, AlertCircle, Key } from "lucide-react";
import clsx from "clsx";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  support_tier?: 'free' | 'supporter' | 'founder' | string;
  support_badge?: boolean;
  avatar_url?: string;
  phone_number?: string;
  default_address?: string;
  default_lat?: number;
  default_lng?: number;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

const COORDINATES: Record<string, { lat: number; lng: number }> = {
  cambe: { lat: -23.2758, lng: -51.2783 },
  londrina: { lat: -23.3102, lng: -51.1627 },
  "são paulo": { lat: -23.5505, lng: -46.6333 },
  "rio de janeiro": { lat: -22.9068, lng: -43.1729 },
  lisboa: { lat: 38.7223, lng: -9.1393 },
  "new york": { lat: 40.7128, lng: -74.006 },
  "buenos aires": { lat: -34.6037, lng: -58.3816 },
};

function geocodeAddress(address: string): { lat: number; lng: number } {
  const normalized = address.toLowerCase().trim();
  if (COORDINATES[normalized]) return COORDINATES[normalized];
  
  for (const key of Object.keys(COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return COORDINATES[key];
    }
  }
  
  if (address.length > 2) {
    const hashLat = (address.charCodeAt(0) * 7 + address.charCodeAt(1) * 3) % 90;
    const hashLng = (address.charCodeAt(0) * 11 + address.charCodeAt(address.length - 1) * 5) % 180;
    return { lat: -23 - (hashLat % 10), lng: -46 - (hashLng % 15) };
  }
  return { lat: -23.5505, lng: -46.6333 }; // São Paulo
}

function maskPhone(value: string) {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

export default function PerfilPage() {
  const router = useRouter();
  const { isLoaded } = useGoogleMaps();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      
      setEmail(user.email || "");
      setGoogleAvatarUrl(user.user_metadata?.avatar_url || null);
      
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (profileError) {
        setError("Erro ao carregar dados do perfil.");
      } else if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setUsername(data.username || "");
        setPhone(data.phone_number ? maskPhone(data.phone_number) : "");
        setAvatarUrl(data.avatar_url || null);
        setCep(data.cep || "");
        setRua(data.rua || "");
        setNumero(data.numero || "");
        setComplemento(data.complemento || "");
        setBairro(data.bairro || "");
        setCidade(data.cidade || "");
        setEstado(data.estado || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleCepBlur() {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      
      if (data && !data.erro) {
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSaveChanges(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleanUsername.length < 3) {
      setError("O nome de usuário deve ter pelo menos 3 caracteres.");
      setSaving(false);
      return;
    }

    try {
      // 1. Verifica se o username está em uso
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (existingUser && existingUser.id !== profile.id) {
        setError("Este nome de usuário já está em uso.");
        setSaving(false);
        return;
      }

      // 2. Geocoding
      let lat: number | null = null;
      let lng: number | null = null;
      let fullAddress = "";

      if (cep && rua && numero && bairro && cidade && estado) {
        fullAddress = `${rua}, ${numero} ${complemento ? `- ${complemento}` : ""} - ${bairro}, ${cidade} - ${estado}, ${cep}`;
        if (window.google && isLoaded) {
          const geocoder = new window.google.maps.Geocoder();
          try {
            const res = await geocoder.geocode({ address: fullAddress });
            if (res.results[0]) {
              lat = res.results[0].geometry.location.lat();
              lng = res.results[0].geometry.location.lng();
            }
          } catch (err) {
            console.error("Erro na geolocalização:", err);
          }
        }
      }

      // 3. Atualiza perfil publico
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          username: cleanUsername,
          phone_number: phone.replace(/\D/g, ""),
          default_address: fullAddress.trim(),
          default_lat: lat,
          default_lng: lng,
          cep: cep.replace(/\D/g, ""),
          rua: rua.trim(),
          numero: numero.trim(),
          complemento: complemento.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          estado: estado.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      // 4. Atualiza senha
      if (password.trim()) {
        const { error: authError } = await supabase.auth.updateUser({
          password: password.trim()
        });
        if (authError) throw authError;
        setPassword("");
      }

      setSuccess("Dados de perfil atualizados com sucesso.");
      setProfile({
        ...profile,
        full_name: fullName.trim(),
        username: cleanUsername,
        phone_number: phone.replace(/\D/g, ""),
        default_address: fullAddress.trim(),
        default_lat: lat || undefined,
        default_lng: lng || undefined,
        cep: cep.replace(/\D/g, ""),
        rua: rua.trim(),
        numero: numero.trim(),
        complemento: complemento.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim()
      });
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar dados.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-zinc-650" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-zinc-900 font-sans flex flex-col">
      <PillNav />
      <main className="flex-1 flex items-center justify-center p-6 pt-32 relative z-10">
        <div className="w-full max-w-xl bg-white border border-zinc-150 rounded-3xl p-8 sm:p-10 shadow-xs">
          
          <div className="text-center sm:text-left space-y-1 mb-8">
            <h1 className="font-serif text-3xl font-semibold text-zinc-900 tracking-tight">
              Gestão de Perfil
            </h1>
            <p className="text-xs text-zinc-500">
              Gerencie suas informações de acesso e identidade visual no SendPluma.
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-655 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {success}
            </div>
          )}

          <form onSubmit={handleSaveChanges} className="space-y-6">
            
            {/* Avatar Row */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-zinc-100">
              {profile && (
                <AvatarEditor
                  userId={profile.id}
                  profileAvatarUrl={avatarUrl}
                  googleAvatarUrl={googleAvatarUrl}
                  fullName={fullName}
                  onUploadSuccess={(newUrl) => {
                    setAvatarUrl(newUrl);
                    setSuccess("Foto de perfil atualizada com sucesso!");
                    setError(null);
                  }}
                  onUploadError={(errMsg) => {
                    setError(errMsg);
                    setSuccess(null);
                  }}
                />
              )}
              <div className="text-center sm:text-left space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-500 border border-zinc-200 rounded-full px-2.5 py-0.5 bg-stone-50">
                  <Shield className="w-3 h-3 text-zinc-400" />
                  {profile?.support_tier === 'founder' || profile?.support_tier === 'supporter' ? (
                    <span className="text-emerald-600 font-bold">Patrono ({getTierDisplayName(profile.support_tier)})</span>
                  ) : (
                    <span>Plano Gratuito</span>
                  )}
                </span>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Formatos aceitos: JPG, PNG. Máx 2MB.
                </p>
              </div>
            </div>

            {/* Inputs editáveis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="fullname" className="block text-xs font-semibold text-zinc-700">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-xs font-semibold text-zinc-700">
                  Nome de Usuário
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-zinc-700">
                  Endereço de E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-stone-50 border border-zinc-150 rounded-xl px-4 py-3 text-xs text-zinc-500 cursor-not-allowed font-medium"
                />
              </div>

              {/* Novos campos de telefone e localidade padrão */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-semibold text-zinc-700">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="(43) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    className="w-full bg-zinc-50 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100 col-span-1 sm:col-span-2">
                <h3 className="text-sm font-semibold text-zinc-900">Endereço de Correspondência</h3>
                <p className="text-[10px] text-zinc-500 -mt-3">
                  Este será usado como a origem padrão para seus despachos.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="cep" className="block text-xs font-semibold text-zinc-700">
                      CEP
                    </label>
                    <div className="relative">
                      <input
                        id="cep"
                        type="text"
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setCep(val.length > 5 ? `${val.slice(0, 5)}-${val.slice(5, 8)}` : val);
                        }}
                        onBlur={handleCepBlur}
                        className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60 font-medium"
                      />
                      {cepLoading && (
                        <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-4">
                    <label htmlFor="rua" className="block text-xs font-semibold text-zinc-700">
                      Rua
                    </label>
                    <input
                      id="rua"
                      type="text"
                      placeholder="Logradouro"
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                      readOnly
                      className="w-full bg-zinc-100 opacity-80 cursor-not-allowed rounded-xl px-4 py-3 text-xs text-zinc-900 outline-none border border-transparent font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="numero" className="block text-xs font-semibold text-zinc-700">
                      Número
                    </label>
                    <input
                      id="numero"
                      type="text"
                      placeholder="Ex: 123"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="complemento" className="block text-xs font-semibold text-zinc-700">
                      Complemento <span className="font-normal text-zinc-400">(Opcional)</span>
                    </label>
                    <input
                      id="complemento"
                      type="text"
                      placeholder="Apto, Sala, etc..."
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="bairro" className="block text-xs font-semibold text-zinc-700">
                      Bairro
                    </label>
                    <input
                      id="bairro"
                      type="text"
                      placeholder="Bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      readOnly
                      className="w-full bg-zinc-100 opacity-80 cursor-not-allowed rounded-xl px-4 py-3 text-xs text-zinc-900 outline-none border border-transparent font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="cidade" className="block text-xs font-semibold text-zinc-700">
                      Cidade
                    </label>
                    <input
                      id="cidade"
                      type="text"
                      placeholder="Cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      readOnly
                      className="w-full bg-zinc-100 opacity-80 cursor-not-allowed rounded-xl px-4 py-3 text-xs text-zinc-900 outline-none border border-transparent font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="estado" className="block text-xs font-semibold text-zinc-700">
                      Estado (UF)
                    </label>
                    <input
                      id="estado"
                      type="text"
                      placeholder="UF"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      readOnly
                      className="w-full bg-zinc-100 opacity-80 cursor-not-allowed rounded-xl px-4 py-3 text-xs text-zinc-900 outline-none border border-transparent font-medium uppercase"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 col-span-1 sm:col-span-2 pt-4 border-t border-zinc-100">
                <label htmlFor="password" className="block text-xs font-semibold text-zinc-700">
                  Alterar Senha (Opcional)
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Deixe em branco para manter a atual"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 transition border border-transparent focus:border-zinc-200/60 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-zinc-900 text-white text-xs font-semibold tracking-wider uppercase py-3.5 rounded-full hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
