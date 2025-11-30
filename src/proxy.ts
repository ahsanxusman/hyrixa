import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.isAdmin === true; // Strict check

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");

  // Debug logging (remove in production)
  if (isAdminPage) {
    console.log("Admin page access attempt:", {
      pathname,
      isLoggedIn,
      isAdmin,
      userEmail: req.auth?.user?.email,
      userRole: req.auth?.user?.role,
    });
  }

  // Admin routes protection - MUST be admin
  if (isAdminPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    if (!isAdmin) {
      console.log("Access denied - not admin");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Dashboard protection
  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
