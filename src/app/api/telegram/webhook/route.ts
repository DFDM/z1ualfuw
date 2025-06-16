
import { type NextRequest, NextResponse } from 'next/server';
import { getUserSchedule, type GetUserScheduleInput } from '@/ai/flows/get-user-schedule';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GOOGLE_CALENDAR_API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  chat: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    type: 'private' | 'group' | 'supergroup' | 'channel';
  };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

async function sendMessage(chatId: number, text: string, parseMode?: 'MarkdownV2' | 'HTML') {
  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set on the server.');
    return { success: false, error: 'Bot token not configured on server' };
  }
  const url = `${TELEGRAM_API_BASE}/sendMessage`;
  const body: { chat_id: number; text: string; parse_mode?: string } = {
    chat_id: chatId,
    text: text,
  };
  if (parseMode) {
    body.parse_mode = parseMode;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorBody = await response.json();
      console.error(`Error sending message to Telegram: ${response.status}`, errorBody);
      return { success: false, error: `Telegram API error: ${response.status}`, details: errorBody };
    }
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Network or other error sending message to Telegram:', error);
    return { success: false, error: 'Failed to send message due to network or other error' };
  }
}

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) {
    console.error('Attempted to handle Telegram webhook, but TELEGRAM_BOT_TOKEN is not set.');
    return NextResponse.json({ status: 'ok_server_config_issue_bot_token' });
  }

  try {
    const body = await req.json() as TelegramUpdate;

    if (body.message && body.message.chat && body.message.text) {
      const message = body.message;
      const chatId = message.chat.id;
      const text = message.text.trim();

      if (text === '/start') {
        await sendMessage(chatId, 'Welcome to the Calendar Alert Bot!\nType /schedule to get your daily agenda.\nType /help to see available commands.');
      } else if (text === '/help') {
        await sendMessage(chatId, 'Available commands:\n/start - Display a welcome message.\n/schedule - Get your formatted schedule for today.\n/help - Show this help message.');
      } else if (text === '/schedule') {
        if (!GOOGLE_CALENDAR_API_KEY) {
          console.error('GOOGLE_CALENDAR_API_KEY is not set on the server.');
          await sendMessage(chatId, 'Sorry, the bot is not properly configured by the admin (missing Calendar API key). Please contact the administrator.');
          return NextResponse.json({ status: 'ok_server_config_issue_calendar_key' });
        }
        
        await sendMessage(chatId, 'Fetching your schedule, please wait...');

        try {
          const scheduleInput: GetUserScheduleInput = { apiKey: GOOGLE_CALENDAR_API_KEY };
          const result = await getUserSchedule(scheduleInput);
          
          // The formatSchedule flow should ideally output Markdown.
          // If it outputs HTML, you might need to adjust parseMode or clean the HTML.
          // For now, assuming the formatter might use markdown-like syntax that Telegram understands.
          await sendMessage(chatId, result.formattedSchedule, 'MarkdownV2');
        } catch (error) {
          console.error('Error getting user schedule for Telegram:', error);
          await sendMessage(chatId, 'Sorry, I encountered an error trying to fetch or format your schedule.');
        }
      } else {
        // Optional: Respond to unrecognised commands or messages
        // await sendMessage(chatId, `I received your message: "${text}". Use /help for commands.`);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing Telegram update:', error);
    return NextResponse.json({ status: 'ok_processing_error' });
  }
}
