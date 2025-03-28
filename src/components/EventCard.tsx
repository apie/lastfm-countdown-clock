
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  id: string;
  title: string;
  artist: string;
  venue: string;
  location: string;
  date: string;
  imageUrl?: string;
  url: string;
}

export default function EventCard({
  title,
  artist,
  venue,
  location,
  date,
  imageUrl,
  url
}: EventCardProps) {
  const eventDate = new Date(date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="w-full max-w-3xl mx-auto border-2 hover:border-lastfm-red transition-colors duration-300 overflow-hidden">
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-lastfm-dark to-lastfm-red flex items-center justify-center">
            <Music size={64} className="text-lastfm-light" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white font-bold text-xl">{artist}</h3>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="flex items-center gap-2 mt-1">
          <MapPin size={16} className="text-lastfm-red" />
          <span>{venue}, {location}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-lastfm-red" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-lastfm-red" />
          <span>{formattedTime}</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-lastfm-red hover:bg-lastfm-red/90"
          onClick={() => window.open(url, '_blank')}
        >
          View on Last.fm
        </Button>
      </CardFooter>
    </Card>
  );
}
