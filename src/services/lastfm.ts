
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

// Mock data to use instead of scraping (which fails due to CORS restrictions)
const MOCK_EVENTS: Record<string, LastFMEvent[]> = {
  // Default events for any user
  default: [
    {
      id: "event-1",
      title: "Metallica World Tour",
      artists: {
        headliner: "Metallica",
        artist: ["Metallica", "Ghost"]
      },
      venue: {
        name: "Madison Square Garden",
        location: {
          city: "New York",
          country: "USA"
        }
      },
      // Set future date (3 weeks from now)
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Metallica at Madison Square Garden",
      image: [
        "https://lastfm.freetls.fastly.net/i/u/64s/64b78e115e42c247e4c37898d63a77c4.jpg",
        "https://lastfm.freetls.fastly.net/i/u/64s/64b78e115e42c247e4c37898d63a77c4.jpg",
        "https://lastfm.freetls.fastly.net/i/u/174s/64b78e115e42c247e4c37898d63a77c4.jpg",
        "https://lastfm.freetls.fastly.net/i/u/300x300/64b78e115e42c247e4c37898d63a77c4.jpg"
      ],
      url: "https://www.last.fm/event/4764766+Metallica+at+Madison+Square+Garden"
    },
    {
      id: "event-2",
      title: "Coldplay Music Of The Spheres Tour",
      artists: {
        headliner: "Coldplay",
        artist: ["Coldplay"]
      },
      venue: {
        name: "Wembley Stadium",
        location: {
          city: "London",
          country: "UK"
        }
      },
      // Set future date (2 months from now)
      startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Coldplay at Wembley Stadium",
      image: [
        "https://lastfm.freetls.fastly.net/i/u/64s/b1d0b1c7e790db228973b1a9c59e73be.jpg",
        "https://lastfm.freetls.fastly.net/i/u/64s/b1d0b1c7e790db228973b1a9c59e73be.jpg",
        "https://lastfm.freetls.fastly.net/i/u/174s/b1d0b1c7e790db228973b1a9c59e73be.jpg",
        "https://lastfm.freetls.fastly.net/i/u/300x300/b1d0b1c7e790db228973b1a9c59e73be.jpg"
      ],
      url: "https://www.last.fm/event/4756321+Coldplay+at+Wembley+Stadium"
    }
  ],
  // Add some specific user events
  "denick": [
    {
      id: "event-1",
      title: "Arctic Monkeys Tour",
      artists: {
        headliner: "Arctic Monkeys",
        artist: ["Arctic Monkeys", "The Hives"]
      },
      venue: {
        name: "O2 Arena",
        location: {
          city: "London",
          country: "UK"
        }
      },
      // Set future date (two weeks from now)
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Arctic Monkeys at O2 Arena",
      image: [
        "https://lastfm.freetls.fastly.net/i/u/64s/a411114c228880959a7a13626afe0f59.jpg",
        "https://lastfm.freetls.fastly.net/i/u/64s/a411114c228880959a7a13626afe0f59.jpg", 
        "https://lastfm.freetls.fastly.net/i/u/174s/a411114c228880959a7a13626afe0f59.jpg",
        "https://lastfm.freetls.fastly.net/i/u/300x300/a411114c228880959a7a13626afe0f59.jpg"
      ],
      url: "https://www.last.fm/event/4751263+Arctic+Monkeys+at+O2+Arena"
    }
  ]
};

export async function getUserEvents(username: string): Promise<LastFMEvent[]> {
  try {
    console.log(`Getting mock events for user: ${username}`);
    
    // Small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return user-specific events if available, otherwise return default events
    return MOCK_EVENTS[username.toLowerCase()] || MOCK_EVENTS.default;
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
