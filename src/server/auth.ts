/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
 type User,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../env/server.mjs";
import { prisma } from "./db";

import CredentialsProvider from "next-auth/providers/credentials";
import { confirmPasswordHash } from "@utils/bcrypt";
/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      user:User
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  callbacks: {

       jwt({ token, user }) {
        if (user) {
          token.email = user.email;
          token.name = user.name;
          token.id = user.id;
        }
        return token;
      },

    // session({ session, user }) {
    //   if (session.user) {
    //     session.user.id = user.id;
    //     session.user.user = user;
    //     // session.user.role = user.role; <-- put other properties on the session here
    //   }
    //   return session;
    // },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: "9b0fd8c9ef7bb87f10b2b4e6f9ak7959",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const name = credentials?.name||"";
        const password = credentials?.password;
        
        try {
          const user = await prisma.user.findUnique({
            where: {
              name,
            },
          });

          if (user) {
            if (password==user.password) {
              return user
            
            } else {
              throw new Error("Password invalid");
              // return null
            }
          } else {
            // If you return null then an error will be displayed advising the user to check their details.
            throw new Error("User not exist");

            // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
          }
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
};

/**
 * Wrapper for getServerSession so that you don't need
 * to import the authOptions in every file.
 * @seimport { User } from '@prisma/client';
e https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};


