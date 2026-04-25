"use client";

import { useEventStore } from "@/store/useEventStore";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, MapPin, User, ArrowLeft, Users, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CapacityBar } from "@/components/CapacityBar";
import { RSVPModal } from "@/components/RSVPModal";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const events = useEventStore((state) => state.events);
  const userRSVPs = useEventStore((state) => state.userRSVPs);
  const removeUserRSVP = useEventStore((state) => state.removeUserRSVP);
  const socket = useEventStore((state) => state.socket);
  
  const event = events.find((e) => e.id === id);
  const isAlreadyRSVPed = userRSVPs.has(id);
  
  const [pulse, setPulse] = useState(false);

  // Pulse effect when rsvpCount changes
  useEffect(() => {
    if (event) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [event?.rsvpCount]);

  if (!event && events.length > 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <Button onClick={() => router.push("/")}>Return to Events</Button>
      </div>
    );
  }

  if (!event) {
    return <div className="flex-1 p-8 animate-pulse bg-muted/20" />;
  }

  const isFull = event.rsvpCount >= event.capacity;

  const handleCancelRSVP = () => {
    if (!socket) return;
    const email = userRSVPs.get(event.id);
    if (!email) return;

    socket.emit("rsvp:cancel", { eventId: event.id, email }, (response: any) => {
      if (response.error) {
        toast({ title: "Error", description: response.error, variant: "destructive" });
      } else {
        removeUserRSVP(event.id);
        toast({ title: "RSVP Cancelled", description: "You are no longer attending this event." });
      }
    });
  };

  return (
    <div className="flex-1 bg-muted/10 pb-12">
      <div className="bg-background border-b sticky top-16 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-2 hover:bg-muted">
            <Link href="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <span className="font-semibold text-lg truncate">Back to Events</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <Badge variant="outline" className="mb-4 capitalize text-sm px-3 py-1 bg-background">
                {event.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground mt-6">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">
                    {format(new Date(event.date), "EEEE, MMMM d, yyyy")} <br className="hidden sm:block" />
                    <span className="text-muted-foreground font-normal">{format(new Date(event.date), "h:mm a")}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">
                    {event.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h3 className="text-xl font-bold mb-3">About this Event</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Location Map
              </h3>
              <div className="w-full h-64 bg-muted rounded-xl border flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=campus&zoom=15&size=800x400&sensor=false')] opacity-20 grayscale group-hover:grayscale-0 transition-all duration-500 bg-cover bg-center mix-blend-overlay"></div>
                <div className="bg-background/80 backdrop-blur px-4 py-2 rounded-lg shadow-sm border font-medium flex items-center gap-2 z-10">
                  <MapPin className="w-4 h-4 text-primary" />
                  Interactive Map Placeholder
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border rounded-2xl p-6 shadow-sm sticky top-36">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="bg-muted p-3 rounded-full">
                  <User className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Organized by</p>
                  <p className="font-bold text-foreground">{event.organizer}</p>
                </div>
              </div>

              <div className="mb-6 relative">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-semibold text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    Availability
                  </span>
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${pulse ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted text-muted-foreground'} transition-all duration-300`}>
                    <RadioTower className="w-3 h-3" />
                    Live
                  </div>
                </div>
                <CapacityBar 
                  current={event.rsvpCount} 
                  max={event.capacity} 
                  className="mt-4"
                />
              </div>

              {isAlreadyRSVPed ? (
                <div className="space-y-3">
                  <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-xl text-center font-medium border border-green-500/20">
                    🎉 You're on the list!
                  </div>
                  <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={handleCancelRSVP}>
                    Cancel my RSVP
                  </Button>
                </div>
              ) : isFull ? (
                <Button disabled className="w-full h-12 text-lg" variant="secondary">
                  Event Full
                </Button>
              ) : (
                <RSVPModal event={event}>
                  <Button className="w-full h-12 text-lg font-bold shadow-md hover:scale-[1.02] transition-transform">
                    Reserve Your Spot
                  </Button>
                </RSVPModal>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
