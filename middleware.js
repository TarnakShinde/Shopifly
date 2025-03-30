import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// export async function middleware(request) {
//     // Create a response object
//     let response = NextResponse.next();

//     const supabase = createServerClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL,
//         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//         {
//             cookies: {
//                 get(name) {
//                     return request.cookies.get(name)?.value;
//                 },
//                 set(name, value, options) {
//                     response.cookies.set({
//                         name,
//                         value,
//                         ...options,
//                     });
//                 },
//                 remove(name, options) {
//                     response.cookies.delete({
//                         name,
//                         ...options,
//                     });
//                 },
//             },
//         }
//     );

//     // Refresh session if available
//     await supabase.auth.getSession();

//     // Get user if session exists
//     const {
//         data: { user },
//     } = await supabase.auth.getUser();

//     // Allow browsing without login by default
//     if (user) {
//         return response;
//     }

//     // Protected routes logic
//     if (request.nextUrl.pathname.startsWith("/cart")) {
//         // Redirect to login page with return URL
//         const url = new URL("/login", request.url);
//         url.searchParams.set("redirect", request.nextUrl.pathname);
//         return NextResponse.redirect(url);
//     }

//     // API routes that require auth
//     if (
//         request.nextUrl.pathname.startsWith("/api/cart") &&
//         (request.method === "POST" || request.method === "PUT")
//     ) {
//         return NextResponse.json(
//             { error: "Login required to add items to cart" },
//             { status: 401 }
//         );
//     }

//     return response;
// }

// export const config = {
//     matcher: [
//         "/cart",
//         "/api/cart/:path*",
//         "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//     ],
// };

export async function middleware(request) {
    let response = NextResponse.next();

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    get(name) {
                        return request.cookies.get(name)?.value;
                    },
                    set(name, value, options) {
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },
                    remove(name, options) {
                        response.cookies.delete({
                            name,
                            ...options,
                        });
                    },
                },
            }
        );

        // Try getting the session, but don't throw if it fails
        try {
            await supabase.auth.getSession();
        } catch (error) {
            console.error("Auth session error in middleware:", error);
            // Continue with the request even if session fetch fails
        }

        // Get user if session exists, but wrap in try/catch
        let user = null;
        try {
            const { data } = await supabase.auth.getUser();
            user = data.user;
        } catch (error) {
            console.error("Get user error in middleware:", error);
            // Continue with null user
        }

        // Rest of your middleware logic
        // ...
    } catch (error) {
        console.error("Middleware error:", error);
        // Return normal response if middleware fails
        return response;
    }

    return response;
}
