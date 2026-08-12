import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token }) => Boolean(token?.id),
  },
});

export const config = {
  matcher: [
    "/",
    "/calendar",
    "/calendar/:path*",
    "/workspaces",
    "/workspaces/:path*",
    "/settings",
    "/settings/:path*",
  ],
};
