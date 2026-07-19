"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { supabase } from "@/lib/supabase";
import { User, LogOut, Heart, Feather, Gift } from "lucide-react";

export default function PillNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { label: "Painel", href: "/painel" },
    { label: "Despachar", href: "/despachar" },
    { label: "Presentes", href: "/presentes", icon: Gift },
  ];

  // Carrega autenticação e dados do perfil
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setProfile(data);
      }
    }
    loadUser();

    // Listeners para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
  }

  return (
    <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
      <nav className="flex items-center gap-6 px-5 py-3 bg-white/70 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-full">


        {/* Links */}
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-xs font-medium transition-all duration-200 px-4 py-1.5 rounded-full flex items-center gap-1.5",
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"
              )}
            >
              {link.icon && <link.icon className={clsx("w-3.5 h-3.5", isActive ? "text-white" : "text-amber-500")} />}
              {link.label}
            </Link>
          );
        })}

        {/* Separador vertical */}
        <div className="h-4 w-px bg-zinc-200" />

        {/* Menu do Usuário */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-8 h-8 rounded-full bg-zinc-150 border border-zinc-200 overflow-hidden flex items-center justify-center text-zinc-700 text-xs font-bold transition hover:border-zinc-400 select-none cursor-pointer focus:outline-none"
              >
                {(profile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                  <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                )}
              </button>
              
              {/* Badge do Apoiador */}
              {(profile?.support_tier === "supporter" || profile?.support_tier === "founder") && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-zinc-100">
                  <div className="bg-amber-100 rounded-full p-0.5">
                    <Feather className="w-2.5 h-2.5 text-amber-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-zinc-100 rounded-2xl shadow-lg p-2 flex flex-col gap-1 z-50">
                <Link
                  href="/perfil"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 rounded-xl transition"
                >
                  <User className="w-3.5 h-3.5 text-zinc-450" />
                  Meu Perfil
                </Link>
                <Link
                  href="/apoiar"
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium rounded-xl transition text-left w-full",
                    (profile?.support_tier === "supporter" || profile?.support_tier === "founder")
                      ? "text-emerald-600 hover:bg-emerald-50/50"
                      : "text-amber-600 hover:bg-amber-50/50"
                  )}
                >
                  <Heart 
                    className={clsx(
                      "w-3.5 h-3.5",
                      (profile?.support_tier === "supporter" || profile?.support_tier === "founder")
                        ? "text-emerald-500 fill-emerald-500/20"
                        : "text-amber-500"
                    )} 
                  />
                  {(profile?.support_tier === "supporter" || profile?.support_tier === "founder") ? "Gerenciar Apoio" : "Apoiar o SendPluma"}
                </Link>
                
                <hr className="border-zinc-100 my-1" />
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer text-left w-full"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 px-3 py-1 rounded-full hover:bg-zinc-100/50 transition-all duration-200"
          >
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
