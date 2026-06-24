// app/(auth)/auth.ts
import { compare } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import postgres from "postgres";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { createGuestUser, getUser } from "@/lib/db/queries";
import { user as userTable } from "@/lib/db/schema";
import { authConfig } from "./auth.config";

const postgresUrl = process.env.POSTGRES_URL;
if (!postgresUrl) {
  throw new Error("POSTGRES_URL is not set");
}
const client = postgres(postgresUrl);
const db = drizzle(client);

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          type: "regular" as const,
        };
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      profile(profile) {
        return {
          id: profile.id?.toString(),
          email: profile.email,
          name: profile.login,
          image: profile.avatar_url,
          type: "regular" as const,
        };
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials.email ?? "");
        const password = String(credentials.password ?? "");
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [u] = users;

        if (!u.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, u.password);

        if (!passwordsMatch) {
          return null;
        }

        return { id: u.id, email: u.email, name: u.name, type: "regular" };
      },
    }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: "guest" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      // Pour Google/GitHub : créer l'utilisateur en DB s'il n'existe pas
      if (account?.provider === "google" || account?.provider === "github") {
        const email = token.email ?? "";
        if (email) {
          try {
            const existing = await db
              .select()
              .from(userTable)
              .where(eq(userTable.email, email))
              .limit(1);
            if (existing.length > 0) {
              token.id = existing[0].id;
              token.type = "regular";
            } else {
              const [newUser] = await db
                .insert(userTable)
                .values({
                  email,
                  name: token.name ?? "",
                  image: token.picture ?? "",
                  emailVerified: true,
                })
                .returning({ id: userTable.id });
              token.id = newUser.id;
              token.type = "regular";
            }
          } catch (err) {
            console.error("jwt DB error:", err);
          }
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }
      return session;
    },
  },
});