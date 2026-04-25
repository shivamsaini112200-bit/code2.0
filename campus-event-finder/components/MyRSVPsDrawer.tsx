"use client";

import { useEventStore } from "@/store/useEventStore";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function MyRSVPsDrawer({ children }: { children: React.ReactNode }) {
  const events = useEventStore((state) => state.events);
  const userRSVPs = useEventStore((state) => state.userRSVPs);
  const removeUserRSVP = useEventStore((state) => state.removeUserRSVP);
  const socket = useEventStore((state) => state.socket);
  const { toast } = useToast();

  const rsvpedEvents = events.filter((e) => userRSVPs.has(e.id));

  const handleCancelRSVP = (eventId: string, email: string) => {
    if (!socket) return;
    
    socket.emit("rsvp:cancel", { eventId, email }, (response: any) => {
      if (response.error) {
        toast({ title: "Error", description: response.error, variant: "destructive" });
      } else {
        removeUserRSVP(eventId);
        toast({ title: "RSVP Cancelled", description: "You are no longer attending this event." });
      }
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full border-l-border/50">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">My RSVPs</SheetTitle>
          <SheetDescription>
            You have {userRSVPs.size} upcoming {userRSVPs.size === 1 ? 'event' : 'events'}.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 flex-1 overflow-y-auto pr-2 space-y-4">
          {rsvpedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Calendar className="w-12 h-12 mb-3 opacity-20" />
              <p>You haven't RSVP'd to any events yet.</p>
            </div>
          ) : (
            rsvpedEvents.map((event) => (
              <div key={event.id} className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(event.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{event.category}</Badge>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleCancelRSVP(event.id, userRSVPs.get(event.id)!)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
