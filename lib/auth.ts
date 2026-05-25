import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import { saveUser } from './users'

const providers: AuthOptions['providers'] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
]

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    })
  )
}

export const authOptions: AuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false
      await saveUser({
        id: `${account.provider}:${account.providerAccountId}`,
        email: user.email,
        name: user.name ?? user.email,
        image: user.image ?? '',
        provider: account.provider,
      })
      return true
    },
    async jwt({ token, account }) {
      if (account) {
        token.userId = `${account.provider}:${account.providerAccountId}`
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
