'use server';

/**
 * @fileOverview Formats a daily schedule from Google Calendar for optimal readability.
 *
 * - formatSchedule - A function that formats the schedule.
 * - FormatScheduleInput - The input type for the formatSchedule function.
 * - FormatScheduleOutput - The return type for the formatSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatScheduleInputSchema = z.object({
  schedule: z.string().describe('The daily schedule from Google Calendar.'),
});
export type FormatScheduleInput = z.infer<typeof FormatScheduleInputSchema>;

const FormatScheduleOutputSchema = z.object({
  formattedSchedule: z
    .string()
    .describe('The formatted daily schedule, optimized for readability.'),
});
export type FormatScheduleOutput = z.infer<typeof FormatScheduleOutputSchema>;

export async function formatSchedule(input: FormatScheduleInput): Promise<FormatScheduleOutput> {
  return formatScheduleFlow(input);
}

const formatSchedulePrompt = ai.definePrompt({
  name: 'formatSchedulePrompt',
  input: {schema: FormatScheduleInputSchema},
  output: {schema: FormatScheduleOutputSchema},
  prompt: `You are an expert at formatting schedules for maximum readability in a Telegram bot.

  Given the following daily schedule from Google Calendar, format it to be as easy to read and understand as possible.
  Use markdown or bolding where appropriate to highlight important information such as times and event titles.

  Schedule:
  {{{schedule}}}`,
});

const formatScheduleFlow = ai.defineFlow(
  {
    name: 'formatScheduleFlow',
    inputSchema: FormatScheduleInputSchema,
    outputSchema: FormatScheduleOutputSchema,
  },
  async input => {
    const {output} = await formatSchedulePrompt(input);
    return output!;
  }
);
