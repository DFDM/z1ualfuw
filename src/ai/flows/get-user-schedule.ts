
'use server';
/**
 * @fileOverview Fetches (or simulates fetching) a user's daily schedule and formats it.
 *
 * - getUserSchedule - A function that gets and formats the user's schedule.
 * - GetUserScheduleInput - The input type for the getUserSchedule function.
 * - GetUserScheduleOutput - The return type for the getUserSchedule function (same as FormatScheduleOutput).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { formatSchedule, type FormatScheduleInput, type FormatScheduleOutput } from './format-schedule';

// Mock data, to be replaced with actual Google Calendar API calls
const MOCK_SCHEDULE_RAW = "10:00 AM - 11:00 AM: Project Standup Meeting (Zoom) - Discuss progress and blockers., 1:00 PM - 2:00 PM: Client Call with Acme Corp (Google Meet) - Present Q3 results., 3:00 PM - 3:30 PM: Quick Sync with Design Team - Review new mockups., 4:00 PM - 5:00 PM: Code Review Session - PR #123 & #124.";

const GetUserScheduleInputSchema = z.object({
  // apiKey is kept for future use when fetching real data
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
        .describe('The formatted daily schedule, optimized for readability.'),
    }),
  },
  async (input) => {
    // Step 1: Fetch (or simulate fetching) the raw schedule
    // In a real scenario, you'd use input.apiKey to fetch data from Google Calendar API
    // For now, we use mock data.
    const rawSchedule = MOCK_SCHEDULE_RAW;

    if (!rawSchedule) {
      // Handle case where schedule couldn't be fetched
      // This part will be more relevant with actual API calls
      return { formattedSchedule: "Could not retrieve schedule data." };
    }

    // Step 2: Format the schedule using the existing formatSchedule flow
    const formatInput: FormatScheduleInput = { schedule: rawSchedule };
    const formattedResult = await formatSchedule(formatInput);
    
    return formattedResult;
  }
);
