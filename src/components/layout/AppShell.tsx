"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Bot, LogOut, Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { AIAssistantDrawer } from "@/components/chat/AIAssistantDrawer";
import { SignInButton } from "@/components/auth/SignInButton";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useRequireAuth } from "@/hooks/use-require-auth";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { data: session, status } = useSession();
  const { requireAuth } = useRequireAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { workspaceId } = useWorkspace();

  const isAuthenticated = status === "authenticated" && Boolean(session?.user?.id);

  return (
    <div className="flex h-screen bg-duocal-void">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-duocal-border bg-duocal-slate/50 px-4 py-3 backdrop-blur-md lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!requireAuth()) return;
                setChatOpen(true);
              }}
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              AI Assistant
            </Button>
            {isAuthenticated ? (
              <>
                {session?.user?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="hidden h-8 w-8 rounded-full border border-duocal-border sm:block"
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/calendar" })}
                  className="gap-2 text-slate-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </>
            ) : (
              <SignInButton size="sm" />
            )}
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto p-4 lg:p-6"
        >
          {children}
        </motion.main>
      </div>

      {isAuthenticated && (
        <AIAssistantDrawer
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          workspaceId={workspaceId ?? undefined}
          onEventCreated={() => {
            window.dispatchEvent(new CustomEvent("duocal:events-changed"));
          }}
        />
      )}
    </div>
  );
}
