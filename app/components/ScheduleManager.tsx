import React, { useEffect, useState } from 'react';
import useIsClient from '../hooks/useIsClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  description?: string;
  type: 'meeting' | 'appointment' | 'task' | 'reminder';
}

interface ScheduleManagerProps {
  events: Event[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
}

export function ScheduleManager({ events, onAddEvent }: ScheduleManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const isClient = useIsClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    description: '',
    type: 'meeting' as const
  });

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.time.trim()) return;
    
    onAddEvent({
      title: newEvent.title,
      date: selectedDate,
      time: newEvent.time,
      description: newEvent.description,
      type: newEvent.type
    });

    setNewEvent({
      title: '',
      time: '',
      description: '',
      type: 'meeting'
    });
    setIsAddDialogOpen(false);
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [] as Event[];
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    ).sort((a, b) => a.time.localeCompare(b.time));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'appointment': return 'bg-green-500';
      case 'task': return 'bg-yellow-500';
      case 'reminder': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'meeting': return 'default';
      case 'appointment': return 'secondary';
      case 'task': return 'outline';
      case 'reminder': return 'destructive';
      default: return 'default';
    }
  };

  // Compute upcoming events on the client to avoid SSR/client mismatches
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!selectedDate) {
      // compute based on now
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = events
        .filter(event => event.date >= today && event.date <= nextWeek)
        .sort((a, b) => {
          const dateCompare = a.date.getTime() - b.date.getTime();
          if (dateCompare === 0) {
            return a.time.localeCompare(b.time);
          }
          return dateCompare;
        })
        .slice(0, 5);
      setUpcomingEvents(upcoming);
    } else {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = events
        .filter(event => event.date >= today && event.date <= nextWeek)
        .sort((a, b) => {
          const dateCompare = a.date.getTime() - b.date.getTime();
          if (dateCompare === 0) {
            return a.time.localeCompare(b.time);
          }
          return dateCompare;
        })
        .slice(0, 5);
      setUpcomingEvents(upcoming);
    }
  }, [events, selectedDate]);

  useEffect(() => {
    if (!selectedDate) setSelectedDate(new Date());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Schedule Manager</h1>
          <p className="text-muted-foreground">
            Manage your calendar and upcoming events
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Schedule a new event for {selectedDate ? (isClient ? selectedDate.toLocaleDateString() : selectedDate.toISOString().slice(0,10)) : '...'}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  value={newEvent.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-time">Time</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-type">Type</Label>
                <select
                  id="event-type"
                  value={newEvent.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewEvent({ ...newEvent, type: e.target.value as typeof newEvent.type })}
                  className="w-full p-2 border border-input bg-background rounded-md"
                >
                  <option value="meeting">Meeting</option>
                  <option value="appointment">Appointment</option>
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-description">Description (Optional)</Label>
                <Input
                  id="event-description"
                  value={newEvent.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Enter description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddEvent}>Add Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Calendar
            </CardTitle>
            <CardDescription>Select a date to view or add events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              selected={selectedDate}
              onSelect={(date: Date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <CardTitle>
              Events for {selectedDate ? (isClient ? selectedDate.toLocaleDateString() : selectedDate.toISOString().slice(0,10)) : '...'}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length} event(s) scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDateEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full mt-1 ${getEventTypeColor(event.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{event.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{event.time}</span>
                      <Badge variant={getEventTypeBadge(event.type) as 'default' | 'secondary' | 'outline' | 'destructive'} className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
              {selectedDateEvents.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No events scheduled for this date
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your next 5 events in the coming week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{event.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {isClient ? event.date.toLocaleDateString() : event.date.toISOString().slice(0,10)} at {event.time}
                    </span>
                    <Badge variant={getEventTypeBadge(event.type) as 'default' | 'secondary' | 'outline' | 'destructive'} className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No upcoming events in the next week
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
