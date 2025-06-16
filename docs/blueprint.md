# **App Name**: Calendar Alert

## Core Features:

- User Authentication: User authentication via Telegram to securely identify and manage user-specific calendar integrations and settings.
- API Key and Phone Number Collection: Collect Google Calendar API key and phone number for SMS notifications via interactive prompts within the Telegram bot. The Google Calendar API key can not be exposed via code.
- Schedule Retrieval: Retrieve today's schedule from the Google Calendar API based on the user's provided API key.
- Schedule Delivery: Send the daily schedule to the user in the Telegram chat, repeating hourly until a 'schedule received' button is pressed.
- SMS Notifications: Trigger an SMS notification via https://smsc.ru/ to the user's registered phone number after the schedule has been sent more than 3 times. This will notify them again of their schedule.
- Smart Formatting: Use a tool to format the daily schedule, so that it is most easily readable and understandable when sent to the user via Telegram. The tool decides how much and when to incorporate things like markdown or bolding, so that the user best understands the information at hand.

## Style Guidelines:

- Primary color: Deep purple (#6750A4) to convey sophistication and reliability, given the personal information involved.
- Background color: Light gray (#F2F0F4), offering a clean, neutral backdrop.
- Accent color: Teal (#50A48F), providing a contrasting highlight for interactive elements.
- Headline font: 'Space Grotesk' sans-serif. Body font: 'Inter' sans-serif. Use 'Space Grotesk' for headlines and 'Inter' for body text.
- Simple, minimalist icons to represent calendar events and bot actions, ensuring clarity and ease of use.
- Clean and organized layout with a focus on readability, ensuring schedules are easy to understand at a glance.
- Subtle animations to confirm actions, such as a checkmark appearing when the 'schedule received' button is pressed, providing visual feedback to the user.