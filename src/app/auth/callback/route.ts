import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  // Se o parâmetro "next" estiver presente, usa-o como redirecionamento, caso contrário redireciona para "/painel"
  const next = searchParams.get("next") ?? "/painel";

  if (code) {
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
              // O método setAll pode disparar exceções se chamado em contextos que não permitem alteração de cookies.
              // Em Next.js Route Handlers, podemos capturar e tratar com segurança.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redireciona o usuário de volta para a tela de login em caso de falha
  return NextResponse.redirect(`${origin}/login?error=Ocorreu um erro no login com Google`);
}
