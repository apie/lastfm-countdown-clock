
import React from 'react';
import { Calendar, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NoEventsFallbackProps {
  username: string;
}

export default function NoEventsFallback({ username }: NoEventsFallbackProps) {
  return (
    <Card className="w-full max-w-xl mx-auto text-center border-2 border-dashed">
      <CardHeader>
        <div className="mx-auto rounded-full bg-muted w-12 h-12 flex items-center justify-center">
          <Calendar className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl mt-4">No upcoming events found</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <Music className="h-20 w-20 text-lastfm-red" />
          <p className="text-muted-foreground">
            {username 
              ? `${username} doesn't have any upcoming events on Last.fm.` 
              : 'Enter your Last.fm username to find upcoming events.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Make sure you have events scheduled and your profile is public.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
