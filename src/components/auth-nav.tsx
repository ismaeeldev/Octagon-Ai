"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { User, LayoutDashboard, Settings, LogOut, ChevronDown } from "lucide-react";

export function AuthNav() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="w-10 h-10 rounded-full bg-muted/50 animate-pulse border border-border/50"></div>
    );
  }

  if (session) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-border/50 hover:bg-muted/50 transition-colors bg-background/50 backdrop-blur-sm shadow-sm cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.4)] group-hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all">
            <User className="w-4 h-4 text-white" />
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/50 bg-background/95 backdrop-blur-md shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-border/50 mb-2">
              <p className="text-sm font-bold truncate">{session.user?.name || "Fighter"}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
            </div>
            
            <div className="px-2 space-y-1">
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors cursor-pointer text-foreground/80 hover:text-foreground">
                  <Settings className="w-4 h-4" />
                  Account Settings
                </div>
              </Link>
            </div>

            <div className="px-2 pt-2 mt-2 border-t border-border/50">
              <div 
                onClick={() => { setIsOpen(false); signOut(); }}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer text-destructive font-medium"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href="/login" className="hidden md:flex">
        <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground cursor-pointer">Log in</Button>
      </Link>
      <Link href="/register">
        <Button variant="default" className="font-bold cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all">Sign up</Button>
      </Link>
    </div>
  );
}
