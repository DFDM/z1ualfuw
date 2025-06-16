
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Keep Label for general use
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Smartphone, Save, BotIcon, Info } from 'lucide-react'; // Renamed Bot to BotIcon to avoid conflict
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const settingsFormSchema = z.object({
  apiKey: z.string().min(10, 'API key must be at least 10 characters long.').optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^(\+?[1-9]\d{1,14}|\s*)$/, 'Invalid phone number format. Expected E.164 or empty.').optional().or(z.literal('')),
  telegramBotToken: z.string().min(20, 'Telegram Bot Token must be at least 20 characters long.').optional().or(z.literal('')),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { user, updateUserSettings } = useAuth();
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      apiKey: user?.apiKey || '',
      phoneNumber: user?.phoneNumber || '',
      telegramBotToken: user?.telegramBotToken || '',
    },
  });
  
  useEffect(() => {
    if (user) {
      form.reset({
        apiKey: user.apiKey || '',
        phoneNumber: user.phoneNumber || '',
        telegramBotToken: user.telegramBotToken || '',
      });
    }
  }, [user, form]);


  const onSubmit: SubmitHandler<SettingsFormValues> = (data) => {
    updateUserSettings({ 
      apiKey: data.apiKey || undefined, 
      phoneNumber: data.phoneNumber || undefined,
      telegramBotToken: data.telegramBotToken || undefined,
    });
    toast({
      title: 'Settings Updated',
      description: 'Your settings have been saved locally for the admin panel.',
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-semibold text-foreground">Settings</h1>
      
      <Alert variant="default" className="bg-primary/10 border-primary/30">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-semibold">Important Configuration Note</AlertTitle>
        <AlertDescription className="text-primary/90">
          The settings saved on this page are stored in your browser's local storage for use within this admin panel.
          For the Telegram bot webhook to function correctly (especially when deployed), the `TELEGRAM_BOT_TOKEN` and `GOOGLE_CALENDAR_API_KEY`
          must also be set as environment variables on the server where the application is hosted. Please refer to the `README.md` for instructions.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <KeyRound className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="font-headline text-2xl">Google Calendar API Key</CardTitle>
                  <CardDescription>
                    Enter your Google Calendar API key. This key is used by the dashboard to fetch your schedule and by the Telegram bot.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="apiKey">API Key</FormLabel>
                    <FormControl>
                      <Input 
                        id="apiKey" 
                        type="password" 
                        placeholder="Enter your Google Calendar API Key" 
                        {...field} 
                        className="text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      Ensure the Google Calendar API is enabled for your project and this key has permissions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-accent" />
                <div>
                  <CardTitle className="font-headline text-2xl">SMS Notification Phone Number</CardTitle>
                  <CardDescription>
                    Enter your phone number (E.164 format, e.g., +12345678900) to receive SMS notifications for overdue schedule acknowledgements.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="phoneNumber">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        id="phoneNumber" 
                        type="tel" 
                        placeholder="+12345678900" 
                        {...field} 
                        className="text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      Include country code. SMS charges may apply. This is used by the dashboard's mock SMS feature.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BotIcon className="h-8 w-8 text-primary" /> {}
                <div>
                  <CardTitle className="font-headline text-2xl">Telegram Bot Token</CardTitle>
                  <CardDescription>
                    Enter your Telegram Bot Token. This token is used to authenticate and control your Telegram bot.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="telegramBotToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="telegramBotToken">Bot Token</FormLabel>
                    <FormControl>
                      <Input 
                        id="telegramBotToken" 
                        type="password" 
                        placeholder="Enter your Telegram Bot Token" 
                        {...field} 
                        className="text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      This token is obtained from BotFather on Telegram. Keep it confidential.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="mt-8 flex justify-end">
            <Button type="submit" className="text-lg py-3 px-6 bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-5 w-5" />
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
