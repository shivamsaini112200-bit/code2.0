"use client";

import { useState, useMemo } from "react";
import { useEventStore } from "@/store/useEventStore";
import { FilterBar, FilterCategory } from "@/components/FilterBar";
import { EventCard } from "@/components/EventCard";
import { CalendarX2 } from "lucide-react";

export default function Home() {
  const events = useEventStore((state) => state.events);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FilterCategory>("all");

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(search.toLowerCase()) || 
        event.location.toLowerCase().includes(search.toLowerCase()) ||
        event.organizer.toLowerCase().includes(search.toLowerCase());
        
      const matchesCategory = category === "all" || event.category === category;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, search, category]);

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary/5 py-12 md:py-20 border-b relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground">
            Discover Campus Events
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the best academic talks, social gatherings, and cultural fests happening around you. RSVP instantly and save your spot.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="mb-8 sticky top-20 z-40">
          <FilterBar 
            search={search} 
            setSearch={setSearch} 
            category={category} 
            setCategory={setCategory} 
          />
        </div>

        {events.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-muted/50 rounded-xl border" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-4">
              <CalendarX2 className="w-12 h-12 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
