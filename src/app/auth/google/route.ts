import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Silencia erros caso seja chamado de um contexto que não permite escrita
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      // Força o fluxo PKCE no servidor
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    console.error("Erro ao iniciar login com Google:", error);
    return NextResponse.redirect(`${origin}/login?error=falha-auth`);
  }

  // Redireciona o usuário para o formulário de consentimento do Google
  return NextResponse.redirect(data.url);
}
