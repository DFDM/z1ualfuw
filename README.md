# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Telegram Bot Setup

The application includes a basic Telegram bot. To make it work, you need to:

1.  **Get a Bot Token**: If you haven't already, create a new bot with BotFather on Telegram to get your unique bot token.
2.  **Set Environment Variable**:
    *   The admin panel allows you to save this token in the settings. This saved token is used by the app internally for features that might require it.
    *   For the Telegram webhook (`src/app/api/telegram/webhook/route.ts`) to function correctly (both locally and when deployed), the `TELEGRAM_BOT_TOKEN` environment variable must be set on the server where the webhook code runs. Add your bot token to the `.env` file in the root of the project:
        ```env
        TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN_HERE"
        ```
3.  **Set Webhook**: Telegram needs to know where to send updates for your bot.
    *   **Deployed App**: Once your app is deployed, take its public URL (e.g., `https://your-app-name.web.app`) and set the webhook by visiting the following URL in your browser, replacing `<YOUR_BOT_TOKEN>` with your actual bot token and `<YOUR_DEPLOYED_APP_URL>` with your app's URL:
        `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DEPLOYED_APP_URL>/api/telegram/webhook`
    *   You can also use `curl`:
        ```bash
        curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DEPLOYED_APP_URL>/api/telegram/webhook"
        ```

## Local Development with Telegram Webhook using ngrok

To test your Telegram bot locally, you need a way for Telegram's servers to reach your local development server. `ngrok` is a great tool for this.

1.  **Start your Next.js development server**:
    ```bash
    npm run dev
    ```
    This usually starts your app on `http://localhost:9002`.

2.  **Start ngrok**: In a **new terminal window**, run the ngrok script defined in `package.json`:
    ```bash
    npm run ngrok
    ```
    This command will start an ngrok tunnel to your local port `9002`. Ngrok will display a public URL (e.g., `https://random-string.ngrok-free.app`). Copy this HTTPS URL.

3.  **Set the Telegram Webhook to your ngrok URL**:
    Use the HTTPS URL from ngrok to tell Telegram where to send updates. Replace `<YOUR_NGROK_URL>` with the URL you copied from ngrok (e.g., `https://random-string.ngrok-free.app`) and `<YOUR_BOT_TOKEN>` (which should be in your `.env` file, e.g., `7842334305:AAEjLab_qYi7i_30OhDlp_VJtK_3oYsPtu4`) in the following command. You can paste this into your browser or use `curl`:

    Browser URL:
    `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_NGROK_URL>/api/telegram/webhook`

    Example with your provided token:
    `https://api.telegram.org/bot7842334305:AAEjLab_qYi7i_30OhDlp_VJtK_3oYsPtu4/setWebhook?url=<YOUR_NGROK_URL>/api/telegram/webhook`

    Using `curl`:
    ```bash
    curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_NGROK_URL>/api/telegram/webhook"
    ```
    Example with your provided token:
    ```bash
    curl "https://api.telegram.org/bot7842334305:AAEjLab_qYi7i_30OhDlp_VJtK_3oYsPtu4/setWebhook?url=<YOUR_NGROK_URL>/api/telegram/webhook"
    ```

    If successful, Telegram will respond with `{"ok":true,"result":true,"description":"Webhook was set"}`.

4.  **Test**: Send a `/start` or `/help` command to your bot in Telegram. You should see activity in your Next.js development server console and your bot should respond.

**Important Notes for ngrok**:
*   Each time you restart ngrok, you will likely get a new public URL. You'll need to update the webhook with Telegram each time.
*   The free version of ngrok has limitations (e.g., session time limits).

To stop ngrok, press `Ctrl+C` in the terminal where it's running.
To remove the webhook, you can call the `setWebhook` method with an empty `url` parameter:
`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=`
