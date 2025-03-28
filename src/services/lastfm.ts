
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

export async function getUserEvents(username: string): Promise<LastFMEvent[]> {
  try {
    // Fetch the user's events page
    const response = await fetch(`https://www.last.fm/user/${username}/events`, {
      // Setting these headers to mimic a browser request
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile page');
    }
    
    const html = await response.text();
    
    // Basic parsing of the HTML to extract events
    // This is a simplified approach and might need adjustments based on Last.fm's HTML structure
    const events: LastFMEvent[] = [];
    const eventBlocks = html.match(/<div\s+class="event-item[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g);
    
    if (!eventBlocks) {
      return [];
    }
    
    eventBlocks.forEach((block, index) => {
      // Extract event details using regex
      // Note: In a production app, using a proper HTML parser would be better
      
      // Title
      const titleMatch = block.match(/<p class="event-item-title">([^<]+)<\/p>/);
      const title = titleMatch ? titleMatch[1].trim() : `Event ${index + 1}`;
      
      // Artist
      const artistMatch = block.match(/<p class="event-item-performers headline">([^<]+)<\/p>/);
      const artist = artistMatch ? artistMatch[1].trim() : 'Unknown Artist';
      
      // Venue
      const venueMatch = block.match(/<p class="event-item-venue">([^<]+)<\/p>/);
      const venue = venueMatch ? venueMatch[1].trim() : 'Unknown Venue';
      
      // Location
      const locationMatch = block.match(/<p class="event-item-place">([^<]+)<\/p>/);
      const location = locationMatch ? locationMatch[1].trim().split(', ') : ['Unknown City', 'Unknown Country'];
      
      // Date
      const dateMatch = block.match(/data-date="([^"]+)"/);
      const startDate = dateMatch ? dateMatch[1] : new Date().toISOString();
      
      // URL
      const urlMatch = block.match(/href="(\/event\/[^"]+)"/);
      const url = urlMatch ? `https://www.last.fm${urlMatch[1]}` : 'https://www.last.fm';
      
      // Image
      const imageMatch = block.match(/src="([^"]+)"/);
      const image = imageMatch ? [imageMatch[1]] : [];
      
      // If we have image and it's a placeholder, add more sizes (for compatibility)
      if (image.length > 0) {
        const img = image[0];
        image.push(img, img, img);
      }
      
      events.push({
        id: `event-${index}`,
        title,
        artists: {
          headliner: artist,
          artist: [artist]
        },
        venue: {
          name: venue,
          location: {
            city: location[0],
            country: location[1] || location[0]
          }
        },
        startDate,
        description: `${artist} at ${venue}`,
        image,
        url
      });
    });
    
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
