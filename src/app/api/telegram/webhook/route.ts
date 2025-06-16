
import { type NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
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
  // Add other update types if needed, e.g., callback_query
}

async function sendMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set on the server.');
    // To Telegram, we should still return OK if the token is missing on our end,
    // to prevent it from endlessly retrying. The issue is on our server configuration.
    return { success: false, error: 'Bot token not configured on server' };
  }
  const url = `${TELEGRAM_API_BASE}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
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
    // Always return a 200 OK to Telegram to prevent retries if the issue is server-side config.
    return NextResponse.json({ status: 'ok_server_config_issue' });
  }

  try {
    const body = await req.json() as TelegramUpdate;
    // console.log('Received Telegram update:', JSON.stringify(body, null, 2));

    if (body.message && body.message.chat && body.message.text) {
      const message = body.message;
      const chatId = message.chat.id;
      const text = message.text;

      if (text === '/start') {
        await sendMessage(chatId, 'Welcome to the Calendar Alert Bot! I am currently under development.\nType /help to see available commands.');
      } else if (text === '/help') {
        await sendMessage(chatId, 'Available commands:\n/start - Display a welcome message.\n/help - Show this help message.');
      } else {
        // Default response for unrecognised commands or messages
        // await sendMessage(chatId, `I received your message: "${text}". Use /help for commands.`);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing Telegram update:', error);
    // Return OK to Telegram to prevent retries for our processing errors
    return NextResponse.json({ status: 'ok_processing_error' });
  }
}
