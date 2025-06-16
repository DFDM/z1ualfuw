
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN_HERE"
GOOGLE_CALENDAR_API_KEY="YOUR_GOOGLE_CALENDAR_API_KEY_HERE"
```

- `TELEGRAM_BOT_TOKEN`: Your unique bot token from BotFather on Telegram.
- `GOOGLE_CALENDAR_API_KEY`: Your API key for Google Calendar API. Ensure the Google Calendar API is enabled for your project in Google Cloud Console and that the API key has permissions to read calendar events.

The admin panel allows you to view/update these keys (stored in your browser's local storage for the admin panel's use). However, for the Telegram webhook (`src/app/api/telegram/webhook/route.ts`) to function correctly (both locally and when deployed), these environment variables **must be set on the server** where the webhook code runs.

## Telegram Bot Setup

The application includes a Telegram bot that can fetch and display your Google Calendar schedule.

1.  **Get a Bot Token**: If you haven't already, create a new bot with BotFather on Telegram to get your unique bot token. Add this token to your `.env` file as `TELEGRAM_BOT_TOKEN`.
2.  **Get Google Calendar API Key**:
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project or select an existing one.
    *   Enable the "Google Calendar API" for your project (APIs & Services > Library).
    *   Create an API Key (APIs & Services > Credentials > Create Credentials > API key).
    *   Restrict the API key to only allow access to the Google Calendar API for security.
    *   Add this API key to your `.env` file as `GOOGLE_CALENDAR_API_KEY`.
3.  **Set Webhook**: Telegram needs to know where to send updates for your bot.
    *   **Deployed App**: Once your app is deployed, take its public URL (e.g., `https://your-app-name.web.app`) and set the webhook by visiting the following URL in your browser, replacing `<YOUR_BOT_TOKEN>` with your actual bot token (from your `.env` file) and `<YOUR_DEPLOYED_APP_URL>` with your app's URL:
        `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DEPLOYED_APP_URL>/api/telegram/webhook`
    *   You can also use `curl`:
        ```bash
        curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DEPLOYED_APP_URL>/api/telegram/webhook"
        ```

## Local Development with Telegram Webhook using ngrok

To test your Telegram bot locally, you need a way for Telegram's servers to reach your local development server. `ngrok` is a great tool for this.

1.  **Ensure `.env` is configured**: Make sure `TELEGRAM_BOT_TOKEN` and `GOOGLE_CALENDAR_API_KEY` are correctly set in your `.env` file.
2.  **Start your Next.js development server**:
    ```bash
    npm run dev
    ```
    This usually starts your app on `http://localhost:9002`.

3.  **Start ngrok**: In a **new terminal window**, run the ngrok script defined in `package.json`:
    ```bash
    npm run ngrok
    ```
    This command will start an ngrok tunnel to your local port `9002`. Ngrok will display a public URL (e.g., `https://random-string.ngrok-free.app`). Copy this HTTPS URL.

4.  **Set the Telegram Webhook to your ngrok URL**:
    Use the HTTPS URL from ngrok to tell Telegram where to send updates. Replace `<YOUR_NGROK_URL>` with the URL you copied from ngrok and `<YOUR_BOT_TOKEN>` (from your `.env` file) in the following command. You can paste this into your browser or use `curl`:

    Browser URL:
    `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_NGROK_URL>/api/telegram/webhook`

    Using `curl`:
    ```bash
    curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_NGROK_URL>/api/telegram/webhook"
    ```

    If successful, Telegram will respond with `{"ok":true,"result":true,"description":"Webhook was set"}`.

5.  **Test**: Send a `/schedule` command to your bot in Telegram. You should see activity in your Next.js development server console and your bot should respond with your schedule (or an error/message if something is wrong). Also test `/start` and `/help`.

**Important Notes for ngrok**:
*   Each time you restart ngrok, you will likely get a new public URL. You'll need to update the webhook with Telegram each time.
*   The free version of ngrok has limitations (e.g., session time limits).

To stop ngrok, press `Ctrl+C` in the terminal where it's running.
To remove the webhook, you can call the `setWebhook` method with an empty `url` parameter:
`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=`
