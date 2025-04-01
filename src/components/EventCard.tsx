
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  id: string;
  title: string;
  artist: string;
  artists: string[];
  venue: string;
  location: string;
  date: string;
  imageUrl?: string;
  artistImageUrl?: string;
  url: string;
}

export default function EventCard({
  title,
  artist,
  artists,
  venue,
  location,
  date,
  imageUrl,
  artistImageUrl,
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
            className="w-full h-48 object-contain"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-lastfm-dark to-lastfm-red flex items-center justify-center">
            <Music size={64} className="text-lastfm-light" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* <h3 className="text-white font-bold text-xl">{title}</h3> */}
        </div>
      </div>
      
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {artists[0] != title &&
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>With <b>{artists.join(', ')}</b></span>
            </CardDescription>
          }
          <CardDescription className="flex items-center gap-2 mt-1">
            <MapPin size={16} className="text-lastfm-red" />
            <span>{venue}, {location}</span>
          </CardDescription>
        </div>
        
        {artist && artist !== "Unknown Artist" && (
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={artistImageUrl || imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"} 
              alt={artist} 
            />
            <AvatarFallback className="bg-lastfm-red text-white">
              {artist.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
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
