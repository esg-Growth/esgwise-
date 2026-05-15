import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { getUserByEmail, createUser } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    ...(process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET
      ? [MicrosoftEntraID({
          clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
          clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
          issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID ? `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0` : undefined,
        })]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(credentials.email as string);
        if (!user || !user.password_hash) return null;
        const isValid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!isValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.company_id,
          isAdmin: user.is_admin === 1,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, ensure user exists in our DB
      if (account?.provider === 'google' || account?.provider === 'microsoft-entra-id') {
        const existingUser = await getUserByEmail(user.email as string);
        if (!existingUser) {
          // Create dummy company and user if they don't exist
          await createUser(user.email as string, require('uuid').v4(), `${user.name || 'User'}'s Company`);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.companyId = (user as any).companyId;
        token.role = (user as any).role;
        token.isAdmin = (user as any).isAdmin;
      } else if (token.email) {
         // Re-fetch from DB to keep role/companyId fresh
         const dbUser = await getUserByEmail(token.email);
         if (dbUser) {
            token.id = dbUser.id;
            token.companyId = dbUser.company_id;
            token.role = dbUser.role;
            token.isAdmin = dbUser.is_admin === 1;
         }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).companyId = token.companyId;
        (session.user as any).role = token.role;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  trustHost: true,
  secret: process.env.AUTH_SECRET || 'f395c1a8e7b4478198f12a1f2b1d5e68',
});
