
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Music } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import EventCard from '@/components/EventCard';
import NoEventsFallback from '@/components/NoEventsFallback';
import { getUserEvents, getNextEvent } from '@/services/lastfm';

const Index = () => {
  const { toast } = useToast();
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('lastfm-username') || '';
  });
  const [inputUsername, setInputUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [allEvents, setAllEvents] = useState<any[]>([]);

  const fetchEvents = async (user: string) => {
    setLoading(true);
    try {
      console.log(`Fetching events for username: ${user}`);
      const events = await getUserEvents(user);
      console.log('Events fetched from API:', events);
      console.log(`Total events found: ${events.length}`);
      
      setAllEvents(events);
      
      const next = getNextEvent(events);
      console.log('Next event calculated:', next);
      setNextEvent(next);
      
      if (!next) {
        console.log('No next event found, showing toast notification');
        toast({
          title: "No upcoming events found",
          description: "We couldn't find any upcoming events for this username.",
          variant: "destructive"
        });
      } else {
        console.log('Next event found:', next.title, 'on', new Date(next.startDate).toLocaleDateString());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please check the username and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Last.fm username",
        variant: "destructive"
      });
      return;
    }
    
    setUsername(inputUsername);
    localStorage.setItem('lastfm-username', inputUsername);
    fetchEvents(inputUsername);
  };

  useEffect(() => {
    if (username) {
      setInputUsername(username);
      fetchEvents(username);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-lastfm-dark/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Music className="h-8 w-8 text-lastfm-red" />
            <h1 className="text-3xl font-bold">Last.fm Event Countdown</h1>
          </div>
          <p className="text-muted-foreground text-center">
            Enter your Last.fm username to see a countdown to your next event
          </p>
        </div>

        <Card className="p-6 mb-8 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Your Last.fm username"
              className="flex-grow"
              disabled={loading}
            />
            <Button 
              type="submit" 
              className="bg-lastfm-red hover:bg-lastfm-red/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                </>
              ) : (
                "Show Events"
              )}
            </Button>
          </form>
        </Card>

        {loading ? (
          <div className="flex justify-center my-20">
            <Loader2 className="h-12 w-12 animate-spin text-lastfm-red" />
          </div>
        ) : nextEvent ? (
          <div className="space-y-10">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Countdown to Your Next Event</h2>
              <p className="text-muted-foreground mb-6">Get ready! The clock is ticking...</p>
              <CountdownTimer targetDate={nextEvent.startDate} className="mb-10" />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-center">Event Details</h3>
              <EventCard
                id={nextEvent.id}
                title={nextEvent.title}
                artist={nextEvent.artists.headliner}
                artists={nextEvent.artists.artist}
                venue={nextEvent.venue.name}
                date={nextEvent.startDate}
                imageUrl={nextEvent.artistImage}
                url={nextEvent.url}
              />
            </div>
            
          </div>
        ) : (
          <>
            {username && <NoEventsFallback username={username} />}
          </>
        )}

        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>Data provided by Last.fm</p>
          <p className="mt-1">This website is not affiliated with Last.fm</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
