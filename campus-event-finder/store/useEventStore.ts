import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'social' | 'sports' | 'cultural' | 'workshop';
  date: string;
  location: string;
  capacity: number;
  rsvpCount: number;
  organizer: string;
  imageUrl?: string;
}

interface EventStoreState {
  events: Event[];
  userRSVPs: Map<string, string>; // eventId -> user email
  socketConnected: boolean;
  socket: Socket | null;
  setEvents: (events: Event[]) => void;
  updateEvent: (event: Event) => void;
  addUserRSVP: (eventId: string, email: string) => void;
  removeUserRSVP: (eventId: string) => void;
  initSocket: () => void;
  disconnectSocket: () => void;
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  events: [],
  userRSVPs: new Map(),
  socketConnected: false,
  socket: null,
  
  setEvents: (events) => set({ events }),
  
  updateEvent: (updatedEvent) => set((state) => ({
    events: state.events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    )
  })),
  
  addUserRSVP: (eventId, email) => set((state) => {
    const newMap = new Map(state.userRSVPs);
    newMap.set(eventId, email);
    return { userRSVPs: newMap };
  }),
  
  removeUserRSVP: (eventId) => set((state) => {
    const newMap = new Map(state.userRSVPs);
    newMap.delete(eventId);
    return { userRSVPs: newMap };
  }),
  
  initSocket: () => {
    const { socket: currentSocket, setEvents, updateEvent } = get();
    
    if (currentSocket) return; // Already initialized

    const socket = io();

    socket.on('connect', () => {
      set({ socketConnected: true });
      socket.emit('get:events');
    });

    socket.on('disconnect', () => {
      set({ socketConnected: false });
    });

    socket.on('events:loaded', (events: Event[]) => {
      setEvents(events);
    });

    socket.on('event:updated', (updatedEvent: Event) => {
      updateEvent(updatedEvent);
    });

    set({ socket });
  },
  
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, socketConnected: false });
    }
  }
}));
