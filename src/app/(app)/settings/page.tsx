
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Smartphone, Save, Bot } from 'lucide-react';
import { useEffect } from 'react';

const settingsFormSchema = z.object({
  apiKey: z.string().min(10, 'API key must be at least 10 characters long.').optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^(\+?[1-9]\d{1,14}|\s*)$/, 'Invalid phone number format.').optional().or(z.literal('')), // E.164 format or empty
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
      description: 'Your settings have been saved.',
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-semibold text-foreground">Settings</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <KeyRound className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="font-headline text-2xl">Google Calendar API Key</CardTitle>
                  <CardDescription>
                    Enter your Google Calendar API key to allow the bot to access your schedule. 
                    This key is stored securely.
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
                      Your API key will not be shared and is used solely for retrieving your calendar data.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="mt-6 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-accent" />
                <div>
                  <CardTitle className="font-headline text-2xl">SMS Notification Phone Number</CardTitle>
                  <CardDescription>
                    Enter your phone number to receive SMS notifications for overdue schedule acknowledgements.
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
                      Include country code (e.g., +1 for USA). SMS charges may apply based on your carrier.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="mt-6 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="font-headline text-2xl">Telegram Bot Secret Key</CardTitle>
                  <CardDescription>
                    Enter your Telegram Bot Secret Key (Token) for the bot to operate.
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
                      This token is used to authenticate and control your Telegram bot. Keep it confidential.
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
