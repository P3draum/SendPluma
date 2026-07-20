import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Atualiza a sessão chamando getUser() conforme recomendação do Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. A rota /auth/callback deve ser pública e ignorada pelo bloqueio de autenticação
  if (pathname.startsWith("/auth/callback")) {
    return response;
  }

  // Definição das rotas internas protegidas do SaaS
  const isDashboardRoute =
    pathname.startsWith("/painel") ||
    pathname.startsWith("/despachar") ||
    pathname.startsWith("/presentes") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/apoiar");

  // 3. Se o usuário NÃO estiver logado e tentar acessar qualquer rota interna, redireciona para /login
  if (!user && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    // Guarda o parâmetro "next" para redirecionamento após o login
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Se o usuário JÁ estiver logado e tentar acessar / (Landing Page) ou /login, redireciona para /painel
  const isLandingOrLogin = pathname === "/" || pathname === "/login";
  if (user && isLandingOrLogin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/painel";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// 5. Configuração do matcher para ignorar arquivos estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Common static image formats (.svg, .png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
