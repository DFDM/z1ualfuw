
'use server';
/**
 * @fileOverview Fetches a user's daily schedule from Google Calendar and formats it.
 *
 * - getUserSchedule - A function that gets and formats the user's schedule.
 * - GetUserScheduleInput - The input type for the getUserSchedule function.
 * - GetUserScheduleOutput - The return type for the getUserSchedule function (same as FormatScheduleOutput).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { formatSchedule, type FormatScheduleInput, type FormatScheduleOutput } from './format-schedule';

const GetUserScheduleInputSchema = z.object({
  apiKey: z.string().optional().describe('The Google Calendar API key for the user.'),
});
export type GetUserScheduleInput = z.infer<typeof GetUserScheduleInputSchema>;

// Output schema is the same as FormatScheduleOutput
export type GetUserScheduleOutput = FormatScheduleOutput;

export async function getUserSchedule(input: GetUserScheduleInput): Promise<GetUserScheduleOutput> {
  return getUserScheduleFlow(input);
}

const getUserScheduleFlow = ai.defineFlow(
  {
    name: 'getUserScheduleFlow',
    inputSchema: GetUserScheduleInputSchema,
    outputSchema: z.object({ // Re-defining to match FormatScheduleOutputSchema
      formattedSchedule: z
        .string()
        .describe('The formatted daily schedule, optimized for readability, or an error/status message.'),
    }),
  },
  async (input) => {
    const apiKey = input.apiKey;

    if (!apiKey) {
      return { formattedSchedule: "Google Calendar API key is not configured. Please provide it." };
    }

    const today = new Date();
    const timeMin = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
    const timeMax = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
    
    const calendarId = 'primary'; // Use 'primary' for the user's main calendar
    const GAPI_EVENTS_URL = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
    
    const queryParams = new URLSearchParams({
      key: apiKey,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '20', // Limit number of events
    });

    const url = `${GAPI_EVENTS_URL}?${queryParams.toString()}`;

    let rawScheduleString = "";

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Calendar API error:', errorData);
        // Try to extract a meaningful message, otherwise use statusText
        const message = errorData?.error?.message || response.statusText || `HTTP error ${response.status}`;
        if (response.status === 403) {
             return { formattedSchedule: `Error fetching schedule: API key might be invalid, Calendar API not enabled, or incorrect permissions. Details: ${message}` };
        }
        return { formattedSchedule: `Error fetching schedule from Google Calendar: ${message}` };
      }

      const data = await response.json();
      const events = data.items;

      if (!events || events.length === 0) {
        return { formattedSchedule: "No events found on your Google Calendar for today." };
      }

      rawScheduleString = events.map((event: any) => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        
        let eventTimeStr = "";
        if (event.start.date) { // All-day event
          eventTimeStr = `(All day)`;
        } else {
          const startTime = new Date(start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
          const endTime = new Date(end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
          eventTimeStr = `${startTime} - ${endTime}`;
        }
        return `${eventTimeStr}: ${event.summary}`;
      }).join('; '); // Use semicolon as a clearer separator for the formatter

    } catch (error: any) {
      console.error('Error calling Google Calendar API:', error);
      return { formattedSchedule: `Failed to connect to Google Calendar API. Check your network or API key. Error: ${error.message}` };
    }
    
    if (!rawScheduleString) {
      // This case should ideally be caught by "No events found" or an error earlier.
      return { formattedSchedule: "Could not retrieve schedule data." };
    }

    const formatInput: FormatScheduleInput = { schedule: rawScheduleString };
    const formattedResult = await formatSchedule(formatInput);
    
    return formattedResult;
  }
);
