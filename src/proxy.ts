import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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

  // Renova/atualiza a sessão
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Rota de callback pública e ignorada pelo bloqueio
  if (pathname.startsWith("/auth/callback") || pathname.startsWith("/auth/google")) {
    return response;
  }

  // Definição das rotas internas protegidas do SaaS
  const isDashboardRoute =
    pathname.startsWith("/painel") ||
    pathname.startsWith("/despachar") ||
    pathname.startsWith("/presentes") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/apoiar") ||
    pathname.startsWith("/onboarding");

  // 3. Se o usuário NÃO estiver logado e tentar acessar qualquer rota interna protegida, redireciona para /login
  if (!user && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Se o usuário JÁ estiver logado e tentar acessar /login, redireciona para /painel
  // (A landing page "/" é pública e acessível para todos, logados ou não)
  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/painel";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// Next.js 16: adapterFn = middlewareModule.default || middlewareModule
// Sem export default, adapterFn seria undefined → "adapterFn is not a function"
export default proxy;

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
