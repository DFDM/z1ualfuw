
'use server';

/**
 * @fileOverview Formats a daily schedule from Google Calendar for optimal readability in Telegram.
 *
 * - formatSchedule - A function that formats the schedule.
 * - FormatScheduleInput - The input type for the formatSchedule function.
 * - FormatScheduleOutput - The return type for the formatSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatScheduleInputSchema = z.object({
  schedule: z.string().describe('The daily schedule from Google Calendar, potentially as a semicolon-separated list of events. Each event might include time and summary.'),
});
export type FormatScheduleInput = z.infer<typeof FormatScheduleInputSchema>;

const FormatScheduleOutputSchema = z.object({
  formattedSchedule: z
    .string()
    .describe('The formatted daily schedule, optimized for readability in Telegram using MarkdownV2. Each event should be on a new line. Escape MarkdownV2 special characters in event summaries.'),
});
export type FormatScheduleOutput = z.infer<typeof FormatScheduleOutputSchema>;

// Helper function to escape MarkdownV2 special characters
function escapeMarkdownV2(text: string): string {
  const PAIRED_SYMBOLS_REGEX = /([_*\[\]()~`>#+\-=|{}.!])/g;
  return text.replace(PAIRED_SYMBOLS_REGEX, '\\$1');
}

export async function formatSchedule(input: FormatScheduleInput): Promise<FormatScheduleOutput> {
  return formatScheduleFlow(input);
}

const formatSchedulePrompt = ai.definePrompt({
  name: 'formatSchedulePrompt',
  input: {schema: FormatScheduleInputSchema},
  output: {schema: FormatScheduleOutputSchema},
  prompt: `You are an expert at formatting schedules for maximum readability in a Telegram bot using MarkdownV2.
The input schedule is a string, possibly with events separated by semicolons.
Each event detail (like time and summary) is part of this string.

Your task is to:
1. Parse the input schedule string. If events are separated by semicolons, treat each part as a distinct event.
2. For each event, identify the time (if present) and the event summary.
3. Format each event on a new line.
4. Use MarkdownV2 for styling:
    - Make event times *bold* (e.g., *10:00 AM - 11:00 AM*).
    - Event summaries should be plain text but properly escaped for MarkdownV2.
    - If an event is marked as "(All day)", display it as such, perhaps bolding the "(All day)" part.
5. Ensure any special MarkdownV2 characters within the event summaries (like _, *, [, ], (, ), ~, \`, >, #, +, -, =, |, {, }, ., !) are properly escaped with a backslash (\\). For example, "Project [Alpha]" should become "Project \\[Alpha\\]".
6. If the input schedule is "No events found on your Google Calendar for today." or similar, just return that message as is, without additional formatting.
7. If the input is an error message (e.g., "Error fetching schedule..."), return it as is.

Example Input Schedule:
"09:00 AM - 10:30 AM: Morning Stand-up [Project X]; (All day): Company Holiday; 02:00 PM - 03:00 PM: Client Meeting - Follow-up for Q1. Results!"

Desired MarkdownV2 Output Example:
*09:00 AM - 10:30 AM*: Morning Stand\\-up \\[Project X\\]
*(All day)*: Company Holiday
*02:00 PM - 03:00 PM*: Client Meeting \\- Follow\\-up for Q1\\. Results\\!

Schedule to format:
{{{schedule}}}
`,
  // Configure safety settings to be less restrictive if needed,
  // but be mindful of Telegram's content policies.
  // For simplicity, default safety settings are used here.
});

// This flow now directly uses the refined prompt which should handle parsing and escaping.
const formatScheduleFlow = ai.defineFlow(
  {
    name: 'formatScheduleFlow',
    inputSchema: FormatScheduleInputSchema,
    outputSchema: FormatScheduleOutputSchema,
  },
  async (input) => {
    // Pre-check for common pass-through messages to avoid unnecessary AI processing
    if (input.schedule.startsWith("No events found") || input.schedule.startsWith("Error fetching") || input.schedule.startsWith("Google Calendar API key is not configured") || input.schedule.startsWith("Failed to connect")) {
      return { formattedSchedule: escapeMarkdownV2(input.schedule) }; // Still escape, just in case.
    }
    
    const {output} = await formatSchedulePrompt(input);
    
    if (output?.formattedSchedule) {
      // The prompt is asked to do the escaping. Double check or implement manual escaping if AI fails.
      // For robustness, one might implement manual splitting and escaping here if AI doesn't reliably do it.
      // Example of manual pre-processing (if AI struggles with complex inputs):
      // const events = input.schedule.split(';').map(e => e.trim());
      // const processedEvents = events.map(eventString => {
      //   const parts = eventString.split(':');
      //   const time = parts.length > 1 ? parts.shift()!.trim() : "";
      //   const summary = escapeMarkdownV2(parts.join(':').trim());
      //   return time ? `*${escapeMarkdownV2(time)}*: ${summary}` : summary;
      // });
      // const manuallyFormatted = processedEvents.join('\n');
      // return { formattedSchedule: manuallyFormatted };

      return output; // Trusting the AI for now based on the prompt.
    }
    return { formattedSchedule: escapeMarkdownV2("Could not format schedule.") };
  }
);

// Example of how to use the escape function if you were to manually build the string before sending to AI or Telegram
// const testSummary = "This is a test_summary with [brackets] and *stars* and a `code` block.";
// console.log(escapeMarkdownV2(testSummary));
// Output: This is a test\\_summary with \\[brackets\\] and \\*stars\\* and a \\`code\\` block.
