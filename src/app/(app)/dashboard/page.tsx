'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatSchedule, type FormatScheduleInput } from '@/ai/flows/format-schedule';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarDays, Bell, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const MOCK_SCHEDULE_RAW = "10:00 AM - 11:00 AM: Project Standup Meeting (Zoom) - Discuss progress and blockers., 1:00 PM - 2:00 PM: Client Call with Acme Corp (Google Meet) - Present Q3 results., 3:00 PM - 3:30 PM: Quick Sync with Design Team - Review new mockups., 4:00 PM - 5:00 PM: Code Review Session - PR #123 & #124.";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formattedSchedule, setFormattedSchedule] = useState<string | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [scheduleAcknowledged, setScheduleAcknowledged] = useState(false);
  const [remindersSent, setRemindersSent] = useState(0);
  const [isProcessingAck, setIsProcessingAck] = useState(false);

  const MOCK_PHONE_NUMBER = user?.phoneNumber || 'not set';

  const fetchAndFormatSchedule = useCallback(async () => {
    if (!user || !user.apiKey) {
      setFormattedSchedule('API key not configured. Please set it in Settings.');
      setIsLoadingSchedule(false);
      return;
    }
    setIsLoadingSchedule(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real scenario, you'd fetch data using user.apiKey here
      // For now, we use mock data.
      const scheduleInput: FormatScheduleInput = { schedule: MOCK_SCHEDULE_RAW };
      const result = await formatSchedule(scheduleInput);
      setFormattedSchedule(result.formattedSchedule);
    } catch (error) {
      console.error('Error formatting schedule:', error);
      setFormattedSchedule('Could not load or format schedule.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to format schedule. Please try again.",
      });
    } finally {
      setIsLoadingSchedule(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAndFormatSchedule();
  }, [fetchAndFormatSchedule]);

  // Simulate hourly reminders if not acknowledged
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (!scheduleAcknowledged && formattedSchedule && !isLoadingSchedule && user?.apiKey) {
      intervalId = setInterval(() => {
        setRemindersSent(prev => {
          const newCount = prev + 1;
          if (newCount > 3 && MOCK_PHONE_NUMBER !== 'not set') {
            toast({
              title: "SMS Notification Triggered",
              description: `Schedule reminder also sent via SMS to ${MOCK_PHONE_NUMBER}.`,
            });
          } else if (newCount <=3) {
             toast({
              title: "Hourly Reminder",
              description: `This is reminder #${newCount} for your schedule.`,
            });
          }
          return newCount;
        });
      }, 15 * 60 * 1000); // Simulate 15 minute reminder for demo
    }
    return () => clearInterval(intervalId);
  }, [scheduleAcknowledged, formattedSchedule, isLoadingSchedule, toast, MOCK_PHONE_NUMBER, user?.apiKey]);

  const handleAcknowledge = async () => {
    setIsProcessingAck(true);
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
    setScheduleAcknowledged(true);
    setRemindersSent(0); // Reset reminders as it's acknowledged
    toast({
      title: "Schedule Acknowledged",
      description: "You won't receive further reminders for today's schedule.",
    });
    setIsProcessingAck(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-semibold text-foreground">Dashboard</h1>
      
      {!user?.apiKey && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Key Missing</AlertTitle>
          <AlertDescription>
            Google Calendar API key is not configured. Please go to Settings to add your API key to retrieve schedules.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-2xl">Today's Schedule</CardTitle>
              <CardDescription>Your daily agenda, smartly formatted for you.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm leading-relaxed">
          {isLoadingSchedule ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Formatting your schedule...</p>
            </div>
          ) : formattedSchedule ? (
            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formattedSchedule.replace(/\n/g, '<br />') }} />
          ) : (
            <div className="text-center py-10">
              <Image src="https://placehold.co/300x200.png" alt="Empty schedule placeholder" width={300} height={200} className="mx-auto rounded-md mb-4" data-ai-hint="empty calendar"/>
              <p className="text-muted-foreground">No schedule information available or API key not set.</p>
            </div>
          )}
        </CardContent>
        {user?.apiKey && formattedSchedule && !isLoadingSchedule && (
          <CardFooter className="border-t p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30">
            {!scheduleAcknowledged ? (
              <Button 
                onClick={handleAcknowledge} 
                disabled={isProcessingAck}
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isProcessingAck ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Mark as Received
              </Button>
            ) : (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="mr-2 h-5 w-5 animate-pulse animation-delay-300" />
                <span>Schedule Acknowledged!</span>
              </div>
            )}
             <div className="text-xs text-muted-foreground text-center sm:text-right">
              {remindersSent > 0 && !scheduleAcknowledged && (
                <p>Reminders sent: {remindersSent}</p>
              )}
              {remindersSent > 3 && !scheduleAcknowledged && MOCK_PHONE_NUMBER !== 'not set' && (
                <p className="text-orange-600 font-medium">SMS notification triggered to {MOCK_PHONE_NUMBER}.</p>
              )}
               {remindersSent > 3 && !scheduleAcknowledged && MOCK_PHONE_NUMBER === 'not set' && (
                <p className="text-orange-600 font-medium">SMS would be triggered if phone number was set.</p>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-accent" />
            <div>
              <CardTitle className="font-headline text-2xl">Notification Settings</CardTitle>
              <CardDescription>Manage how you receive schedule alerts.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Hourly reminders will be sent to your Telegram until you acknowledge the schedule.</p>
          <p>
            If the schedule is sent more than 3 times without acknowledgement, an additional SMS notification will be sent to:
            <strong className="text-primary ml-1">{MOCK_PHONE_NUMBER === 'not set' ? 'Phone number not set' : MOCK_PHONE_NUMBER}</strong>.
          </p>
          <p className="text-xs text-muted-foreground">
            You can update your phone number in the <Link href="/settings" className="underline hover:text-primary">Settings</Link> page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Link component for use inside CardContent (client component)
const Link = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <a href={href} className={className}>{children}</a>
);
