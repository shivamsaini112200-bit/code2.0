"use client";

import { useEventStore } from "@/store/useEventStore";
import { useEffect } from "react";
import Link from "next/link";
import { CalendarDays, Bell } from "lucide-react";
import { MyRSVPsDrawer } from "./MyRSVPsDrawer";
import { Button } from "./ui/button";

export function Navbar() {
  const initSocket = useEventStore((state) => state.initSocket);
  const disconnectSocket = useEventStore((state) => state.disconnectSocket);
  const socketConnected = useEventStore((state) => state.socketConnected);
  const userRSVPs = useEventStore((state) => state.userRSVPs);

  useEffect(() => {
    initSocket();
    return () => {
      disconnectSocket();
    };
  }, [initSocket, disconnectSocket]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground group-hover:scale-105 transition-transform">
            <CalendarDays className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
            Campus Event Finder
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium bg-muted/50 px-3 py-1.5 rounded-full border">
            <span className="relative flex h-2.5 w-2.5">
              {socketConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="hidden sm:inline-block">
              {socketConnected ? "Live Updates" : "Reconnecting..."}
            </span>
          </div>

          <MyRSVPsDrawer>
            <Button variant="outline" className="relative h-10 px-4 rounded-full font-medium shadow-sm hover:shadow">
              <Bell className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline-block">My RSVPs</span>
              {userRSVPs.size > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background">
                  {userRSVPs.size}
                </span>
              )}
            </Button>
          </MyRSVPsDrawer>
        </div>
      </div>
    </nav>
  );
}
