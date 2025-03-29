
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
  image: Array<{
    '#text': string;
    size: string;
  }> | string[];
  url: string;
}

const API_BASE_URL = 'http://localhost:5000';

export async function getUserEvents(username: string): Promise<LastFMEvent[]> {
  try {
    console.log(`Fetching events for user: ${username}`);
    
    if (!username.trim()) {
      console.log('Empty username, returning empty array');
      return [];
    }
    
    console.log(`Making request to: ${API_BASE_URL}/api/events/${username}`);
    const response = await fetch(`${API_BASE_URL}/api/events/${username}`);
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      console.error('Error response:', response.statusText);
      throw new Error('Failed to fetch events');
    }
    
    const data = await response.json();
    console.log('Raw API response data:', data);
    
    if (!data.events || !Array.isArray(data.events)) {
      console.warn('Events data is not an array or is missing:', data);
      return [];
    }
    
    // Process events to ensure they have the correct format
    const processedEvents = data.events.map((event: any) => ({
      ...event,
      // Ensure startDate is a string (ISO format)
      startDate: typeof event.startDate === 'number' 
        ? new Date(event.startDate).toISOString() 
        : event.startDate
    }));
    
    console.log(`Processed ${processedEvents.length} events`);
    return processedEvents;
  } catch (error) {
    console.error('Error fetching Last.fm events:', error);
    return [];
  }
}

export function getNextEvent(events: LastFMEvent[]): LastFMEvent | null {
  if (!events || events.length === 0) {
    console.log('No events to process in getNextEvent');
    return null;
  }
  
  const now = new Date();
  console.log('Current date for comparison:', now.toISOString());
  
  const futureEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    const isFuture = eventDate > now;
    console.log(`Event date: ${eventDate.toISOString()}, is in future: ${isFuture}`);
    return isFuture;
  });
  
  if (futureEvents.length === 0) {
    console.log('No future events found');
    return null;
  }
  
  // Sort events by date and get the closest one
  const sortedEvents = futureEvents.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  console.log(`Found ${sortedEvents.length} future events, next event is:`, sortedEvents[0].title);
  return sortedEvents[0];
}
