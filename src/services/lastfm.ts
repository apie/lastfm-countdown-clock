
interface LastFMEvent {
  id: string;
  title: string;
  artists: {
    headliner: string;
    artist: string[];
  };
  venue: {
    name: string;
    location: {
      city: string;
      country: string;
    };
  };
  startDate: string;
  description: string;
  image: string[];
  url: string;
}

interface LastFMUserEvents {
  events: {
    event: LastFMEvent[];
  };
}

const API_KEY = 'f21088bf9097b49ad4e7f487abab981e'; // Public API key for Last.fm
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export async function getUserEvents(username: string): Promise<LastFMEvent[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?method=user.getEvents&user=${username}&api_key=${API_KEY}&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    const data = await response.json() as LastFMUserEvents;
    
    // Last.fm API can be inconsistent with event format
    if (!data.events || !data.events.event) {
      return [];
    }
    
    // Handle both array and single event responses
    const events = Array.isArray(data.events.event) 
      ? data.events.event 
      : [data.events.event];
      
    return events;
  } catch (error) {
    console.error('Error fetching Last.fm events:', error);
    return [];
  }
}

export function getNextEvent(events: LastFMEvent[]): LastFMEvent | null {
  if (!events || events.length === 0) {
    return null;
  }
  
  const now = new Date();
  const futureEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate > now;
  });
  
  if (futureEvents.length === 0) {
    return null;
  }
  
  // Sort events by date and get the closest one
  return futureEvents.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  })[0];
}
