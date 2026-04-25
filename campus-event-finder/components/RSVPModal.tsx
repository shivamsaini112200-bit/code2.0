"use client";

import { useState } from "react";
import { useEventStore, Event } from "@/store/useEventStore";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RSVPModalProps {
  event: Event;
  children: React.ReactNode;
}

export function RSVPModal({ event, children }: RSVPModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const socket = useEventStore((state) => state.socket);
  const addUserRSVP = useEventStore((state) => state.addUserRSVP);
  const userRSVPs = useEventStore((state) => state.userRSVPs);
  const { toast } = useToast();

  const isAlreadyRSVPed = userRSVPs.has(event.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    
    if (!socket) {
      toast({ title: "Connection Error", description: "Not connected to server", variant: "destructive" });
      return;
    }

    setLoading(true);
    socket.emit("rsvp:submit", { eventId: event.id, name, email }, (response: any) => {
      setLoading(false);
      
      if (response.error) {
        toast({ title: "RSVP Failed", description: response.error, variant: "destructive" });
      } else {
        addUserRSVP(event.id, email);
        toast({ title: "Success!", description: `You are now RSVP'd for ${event.title}.` });
        setOpen(false);
      }
    });
  };

  if (isAlreadyRSVPed) {
    return (
      <Button variant="secondary" className="w-full text-green-600 dark:text-green-400 font-medium cursor-default">
        You're Attending!
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>RSVP for {event.title}</DialogTitle>
            <DialogDescription>
              Enter your details to reserve your spot. Only {event.capacity - event.rsvpCount} spots left!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="john@campus.edu"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Confirming..." : "Confirm RSVP"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
