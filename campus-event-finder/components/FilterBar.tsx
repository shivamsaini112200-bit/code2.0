"use client";

import { Input } from "@/components/ui/input";
import { Search, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type FilterCategory = 'all' | 'academic' | 'social' | 'sports' | 'cultural' | 'workshop';

interface FilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  category: FilterCategory;
  setCategory: (val: FilterCategory) => void;
}

export function FilterBar({ search, setSearch, category, setCategory }: FilterBarProps) {
  const categories: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All Events' },
    { id: 'academic', label: 'Academic' },
    { id: 'social', label: 'Social' },
    { id: 'sports', label: 'Sports' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'workshop', label: 'Workshop' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-card border shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search events by title, location, or organizer..." 
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0 mr-1" />
        {categories.map(c => (
          <Badge
            key={c.id}
            variant={category === c.id ? "default" : "outline"}
            className="cursor-pointer capitalize px-3 py-1 hover:bg-primary/90 hover:text-primary-foreground transition-colors shrink-0"
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
