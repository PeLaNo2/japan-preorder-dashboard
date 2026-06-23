import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "./prisma"

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? "").split(",").map((e) => e.trim())

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return ALLOWED_EMAILS.includes(profile?.email ?? "")
      }
      return false
    },
    async session({ session }) {
      if (session.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        })
        if (user) {
          session.user.id = user.id
          session.user.role = user.role
        }
      }
      return session
    },
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        await prisma.user.upsert({
          where: { email: profile.email },
          update: {
            name: profile.name,
            avatar: (profile as { picture?: string }).picture || undefined,
          },
          create: {
            email: profile.email,
            name: profile.name,
            avatar: (profile as { picture?: string }).picture || undefined,
            role: "OWNER",
          },
        })
        token.email = profile.email
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})
