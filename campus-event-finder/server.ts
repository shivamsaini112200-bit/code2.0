import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { randomUUID } from 'crypto';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Define Types
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

export interface RSVP {
  id: string;
  eventId: string;
  name: string;
  email: string;
  timestamp: string;
}

// In-Memory Data Store
let events: Event[] = [
  {
    id: randomUUID(),
    title: 'Annual Tech Symposium',
    description: 'Join us for a full day of inspiring talks, hands-on workshops, and networking with tech industry leaders.',
    category: 'academic',
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 days
    location: 'Main Auditorium',
    capacity: 200,
    rsvpCount: 0,
    organizer: 'Computer Science Department',
  },
  {
    id: randomUUID(),
    title: 'Diwali Night Cultural Fest',
    description: 'Celebrate the festival of lights with music, dance performances, and delicious traditional food.',
    category: 'cultural',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    location: 'Campus Quad',
    capacity: 500,
    rsvpCount: 0,
    organizer: 'Indian Students Association',
  },
  {
    id: randomUUID(),
    title: 'Inter-College Basketball Tournament',
    description: 'Cheer for our university team as they face off against regional rivals in the semi-finals.',
    category: 'sports',
    date: new Date(Date.now() + 86400000 * 1).toISOString(),
    location: 'Sports Complex',
    capacity: 150,
    rsvpCount: 0,
    organizer: 'Athletics Council',
  },
  {
    id: randomUUID(),
    title: 'Resume & Career Workshop',
    description: 'Get your resume reviewed by professionals and learn tips for acing your next interview.',
    category: 'workshop',
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    location: 'Student Union Room 204',
    capacity: 60,
    rsvpCount: 0,
    organizer: 'Career Center',
  },
  {
    id: randomUUID(),
    title: 'Open Mic Night',
    description: 'Share your talents or just enjoy performances by fellow students. Singers, poets, and comedians welcome!',
    category: 'social',
    date: new Date(Date.now() + 86400000 * 4).toISOString(),
    location: 'Campus Coffeehouse',
    capacity: 80,
    rsvpCount: 0,
    organizer: 'Student Activities Board',
  },
  {
    id: randomUUID(),
    title: 'AI in Healthcare Seminar',
    description: 'A deep dive into how artificial intelligence is transforming medical research and patient care.',
    category: 'academic',
    date: new Date(Date.now() + 86400000 * 7).toISOString(),
    location: 'Science Building Lecture Hall',
    capacity: 120,
    rsvpCount: 0,
    organizer: 'Medical Sciences Faculty',
  },
  {
    id: randomUUID(),
    title: 'Yoga for Stress Relief',
    description: 'Take a break from studying with a relaxing 60-minute yoga and meditation session.',
    category: 'workshop',
    date: new Date(Date.now() + 86400000 * 1.5).toISOString(),
    location: 'Recreation Center Studio B',
    capacity: 30,
    rsvpCount: 0,
    organizer: 'Wellness Center',
  },
  {
    id: randomUUID(),
    title: 'Global Food Festival',
    description: 'Taste dishes from around the world prepared by international student organizations.',
    category: 'social',
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    location: 'Dining Hall Plaza',
    capacity: 300,
    rsvpCount: 0,
    organizer: 'International Student Affairs',
  }
];

let rsvps: RSVP[] = [];

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    try {
      if (!req.url) return;
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Initial load
    socket.on('get:events', () => {
      socket.emit('events:loaded', events);
    });

    socket.on('rsvp:submit', (data: { eventId: string; name: string; email: string }, callback) => {
      const { eventId, name, email } = data;
      const eventIndex = events.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) {
        if(callback) callback({ error: 'Event not found' });
        return;
      }

      const event = events[eventIndex];
      
      // Check if already RSVPed
      const existingRsvp = rsvps.find(r => r.eventId === eventId && r.email === email);
      if (existingRsvp) {
        if(callback) callback({ error: 'Already RSVPed with this email' });
        return;
      }

      if (event.rsvpCount >= event.capacity) {
        if(callback) callback({ error: 'Event is at full capacity' });
        return;
      }

      const newRsvp: RSVP = {
        id: randomUUID(),
        eventId,
        name,
        email,
        timestamp: new Date().toISOString()
      };

      rsvps.push(newRsvp);
      events[eventIndex] = {
        ...event,
        rsvpCount: event.rsvpCount + 1
      };

      if(callback) callback({ success: true, rsvp: newRsvp });
      
      // Broadcast updated event to ALL clients
      io.emit('event:updated', events[eventIndex]);
    });

    socket.on('rsvp:cancel', (data: { eventId: string; email: string }, callback) => {
      const { eventId, email } = data;
      const eventIndex = events.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) {
        if(callback) callback({ error: 'Event not found' });
        return;
      }

      const rsvpIndex = rsvps.findIndex(r => r.eventId === eventId && r.email === email);
      
      if (rsvpIndex === -1) {
        if(callback) callback({ error: 'RSVP not found' });
        return;
      }

      rsvps.splice(rsvpIndex, 1);
      const event = events[eventIndex];
      
      events[eventIndex] = {
        ...event,
        rsvpCount: Math.max(0, event.rsvpCount - 1)
      };

      if(callback) callback({ success: true });
      
      // Broadcast updated event
      io.emit('event:updated', events[eventIndex]);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
