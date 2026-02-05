"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ShadSideBar from "./components/ShadSideBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<{
    isLoggedIn: boolean;
    isActive: boolean;
  } | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkUserStatus() {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No session, redirect to login
        router.push('/login');
        return;
      }

      // Get user profile to check isActive status
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("isActive")
        .eq("userId", session.user.id)
        .single();

      if (error || !profile) {
        console.error("Error fetching profile:", error);
        // Logout and redirect to login
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      if (!profile.isActive) {
        // User is not active, redirect to deactivated page
        router.push('/deactivated');
        return;
      }

      setUserStatus({
        isLoggedIn: true,
        isActive: profile.isActive,
      });
      setLoading(false);
    }

    checkUserStatus();
  }, [supabase, router]);

  // Handle deactivation redirect with auto-logout
  useEffect(() => {
    if (userStatus && !userStatus.isActive) {
      // Logout after 5 seconds
      const timer = setTimeout(async () => {
        await supabase.auth.signOut();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [userStatus, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de votre compte...</p>
          <p className="text-sm text-gray-400 mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (!userStatus?.isLoggedIn || !userStatus?.isActive) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex w-screen h-screen overflow-hidden">
        {/* Sidebar */}
        <ShadSideBar/>

        {/* Right section */}
        <div className="flex flex-col flex-1 min-w-0 bg-gray-50 ">
          {/* Header */}
          <header className="flex h-16 items-center border-b border-gray-300 px-4 shrink-0">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <span className="font-semibold">Bienvenue</span>
          </header>

          {/* Main Content - Takes remaining height */}
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}