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

const API_BASE_URL = 'http://localhost:5000';

export async function getUserEvents(username: string): Promise<LastFMEvent[]> {
  try {
    console.log(`Fetching events for user: ${username}`);
    
    if (!username.trim()) {
      return [];
    }
    
    const response = await fetch(`${API_BASE_URL}/api/events/${username}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    const data = await response.json();
    
    if (!data.events || data.events.length === 0) {
      console.log('No events found');
      return [];
    }
    
    // Process events to ensure they have the correct format
    return data.events.map((event: any) => ({
      ...event,
      // Convert timestamp back to ISO string format if needed
      startDate: typeof event.startDate === 'number' 
        ? new Date(event.startDate).toISOString() 
        : event.startDate
    }));
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
