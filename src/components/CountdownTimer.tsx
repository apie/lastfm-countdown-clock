
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  if (isExpired) {
    return (
      <div className={cn("text-center", className)}>
        <div className="text-3xl font-bold text-lastfm-red">The event is happening now!</div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="flex flex-col">
          <div className="text-5xl md:text-7xl font-bold bg-lastfm-dark rounded-lg p-4 text-lastfm-light">
            {formatNumber(timeLeft.days)}
          </div>
          <div className="text-sm mt-2 text-muted-foreground">Days</div>
        </div>
        <div className="flex flex-col">
          <div className="text-5xl md:text-7xl font-bold bg-lastfm-dark rounded-lg p-4 text-lastfm-light">
            {formatNumber(timeLeft.hours)}
          </div>
          <div className="text-sm mt-2 text-muted-foreground">Hours</div>
        </div>
        <div className="flex flex-col">
          <div className="text-5xl md:text-7xl font-bold bg-lastfm-dark rounded-lg p-4 text-lastfm-light">
            {formatNumber(timeLeft.minutes)}
          </div>
          <div className="text-sm mt-2 text-muted-foreground">Minutes</div>
        </div>
        <div className="flex flex-col">
          <div className="text-5xl md:text-7xl font-bold bg-lastfm-dark rounded-lg p-4 text-lastfm-light animate-pulse-slow">
            {formatNumber(timeLeft.seconds)}
          </div>
          <div className="text-sm mt-2 text-muted-foreground">Seconds</div>
        </div>
      </div>
    </div>
  );
}
