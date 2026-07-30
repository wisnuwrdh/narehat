import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"
import { hashPassword, verifyPassword } from "@/lib/crypto/password"
import { CredentialsSignin } from "@auth/core/errors"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        try {
          const { email, password, action, name } = credentials as {
            email: string
            password: string
            action?: string
            name?: string
          }
          const supabase = getSupabase()

          if (action === "register") {
            const { data: existing, error: checkError } = await supabase
              .from("users")
              .select("id")
              .eq("email", email)
              .maybeSingle()
            if (checkError) {
              const err = new CredentialsSignin()
              err.code = `DB check gagal: ${checkError.message}`
              throw err
            }
            if (existing) {
              const err = new CredentialsSignin()
              err.code = "Email sudah terdaftar"
              throw err
            }

            let password_hash: string
            try {
              password_hash = await hashPassword(password)
            } catch {
              const err = new CredentialsSignin()
              err.code = "Hash password gagal: Web Crypto API tidak tersedia"
              throw err
            }

            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert({ email, name, password_hash })
              .select("id, email, name")
              .single()
            if (insertError) {
              const err = new CredentialsSignin()
              err.code = `DB insert gagal: ${insertError.message}`
              throw err
            }

            if (!newUser) {
              const err = new CredentialsSignin()
              err.code = "Gagal mendaftarkan akun"
              throw err
            }
            return { id: newUser.id, email: newUser.email, name: newUser.name }
          }

          const { data: user, error: loginError } = await supabase
            .from("users")
            .select("id, email, name, password_hash")
            .eq("email", email)
            .single()
          if (loginError) {
            const err = new CredentialsSignin()
            err.code = `DB login gagal: ${loginError.message}`
            throw err
          }

          if (!user?.password_hash) return null

          let valid: boolean
          try {
            valid = await verifyPassword(password, user.password_hash)
          } catch {
            const err = new CredentialsSignin()
            err.code = "Verify password gagal: Web Crypto API tidak tersedia"
            throw err
          }
          if (!valid) return null
          return { id: user.id, email: user.email, name: user.name }
        } catch (err) {
          console.error("[Auth Error]", err)
          if (err instanceof CredentialsSignin) throw err
          const wrapped = new CredentialsSignin()
          wrapped.code = err instanceof Error ? err.message : "Terjadi kesalahan"
          throw wrapped
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const supabase = getSupabase()

      if (account?.provider === "google") {
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email!)
          .maybeSingle()
        if (!existing) {
          await supabase.from("users").insert({
            id: user.id,
            email: user.email!,
            name: user.name || "User",
          })
        }
      }

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "mywisnuwardhana@gmail.com"
      if (user.email === adminEmail) {
        const { data: target } = await supabase
          .from("users")
          .select("id")
          .eq("email", adminEmail)
          .maybeSingle()
        if (target) {
          await supabase.from("users").update({ role: "admin" }).eq("id", target.id)
        }
      }

      return true
    },
    async jwt({ token, account, user }) {
      if (user) {
        if (account?.provider === "google") {
          const supabase = getSupabase()
          const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email!)
            .maybeSingle()
          token.id = dbUser?.id || user.id
        } else {
          token.id = user.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
    async authorized({ request: { nextUrl }, auth: session }) {
      const isLoggedIn = !!session?.user
      const { pathname } = nextUrl

      const isAppRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/tracker") ||
        pathname.startsWith("/progress") ||
        pathname.startsWith("/ai-consult") ||
        pathname.startsWith("/recommendations") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/routine")

      const isAuthRoute =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password")

      if (!isLoggedIn && isAppRoute) {
        return Response.redirect(new URL("/login", nextUrl))
      }

      if (
        isLoggedIn &&
        isAuthRoute &&
        !pathname.startsWith("/onboarding") &&
        !pathname.startsWith("/reset-password")
      ) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
})
