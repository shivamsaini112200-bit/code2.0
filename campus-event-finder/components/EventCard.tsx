import { Calendar, MapPin, User, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/store/useEventStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CapacityBar } from "./CapacityBar";
import { Button } from "./ui/button";
import Link from "next/link";
import { RSVPModal } from "./RSVPModal";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const categoryColors = {
    academic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200",
    social: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 hover:bg-pink-200",
    sports: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200",
    cultural: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200",
    workshop: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-200",
  };

  const isFull = event.rsvpCount >= event.capacity;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-5 pb-4">
        <div className="flex justify-between items-start mb-2 gap-2">
          <Badge className={categoryColors[event.category] + " capitalize border-none"}>
            {event.category}
          </Badge>
          <div className="text-xs font-semibold px-2 py-1 bg-secondary rounded-full flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(event.date), "MMM d, h:mm a")}
          </div>
        </div>
        <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <User className="w-4 h-4 shrink-0" />
          <span className="truncate">By {event.organizer}</span>
        </div>
        
        <div className="mt-auto pt-2">
          <CapacityBar current={event.rsvpCount} max={event.capacity} />
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 gap-3 border-t border-border/50 bg-muted/20 mt-4 h-[72px] flex items-center">
        <div className="flex-1">
          {isFull ? (
            <Button disabled className="w-full" variant="secondary">
              Event Full
            </Button>
          ) : (
            <RSVPModal event={event}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm transition-all hover:scale-[1.02]">
                RSVP Now
              </Button>
            </RSVPModal>
          )}
        </div>
        <Button variant="outline" size="icon" asChild className="shrink-0 bg-background/50 hover:bg-background">
          <Link href={`/events/${event.id}`}>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
