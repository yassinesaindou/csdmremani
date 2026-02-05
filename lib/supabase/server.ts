import { createServerClient as serverClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { CookieOptions } from "@supabase/ssr";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client
export const createServerClient = () => {
  return serverClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        const cookieStore = await cookies(); // Await the promise
        return cookieStore.getAll(); // Returns { name, value }[]
      },
      async setAll(cookiesToSet) {
        try {
          const cookieStore = await cookies(); // Await the promise
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions);
          });
        } catch (error) {
          console.error("Error setting cookies:", error);
        }
      },
    },
  });
};