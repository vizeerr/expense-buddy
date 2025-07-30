import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user }) {
      await dbConnect()

      const email = user.email.toLowerCase()

      let existingUser = await User.findOne({ email })

      if (!existingUser) {
        existingUser = await User.create({
          name: user.name.toLowerCase(),
          email,
          password: '', // empty, as user is authenticated by Google
          emailVerified: true,
          googleAuth: true, // optional flag
        })
      }

      return true
    },

    async jwt({ token, user }) {
      if (user) token.user = user
      return token
    },

    async session({ session, token }) {
      session.user = token.user
      return session
    },
  },
})

export { handler as GET, handler as POST }
