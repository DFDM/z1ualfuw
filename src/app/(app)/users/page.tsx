
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users as UsersIcon, UserCircle } from 'lucide-react'; // Renamed to avoid conflict
import Image from 'next/image';

interface BotUser {
  id: string;
  username: string;
  telegramId: string;
  joinDate: string;
}

const mockUsers: BotUser[] = [
  { id: '1', username: 'Alice Wonderland', telegramId: '@alice_tg', joinDate: '2024-01-15' },
  { id: '2', username: 'Bob The Builder', telegramId: '@bob_constructor', joinDate: '2024-02-20' },
  { id: '3', username: 'Charlie Brown', telegramId: '@good_grief', joinDate: '2024-03-10' },
  { id: '4', username: 'Diana Prince', telegramId: '@wonder_woman', joinDate: '2024-04-05' },
  { id: '5', username: 'Edward Scissorhands', telegramId: '@ed_hands', joinDate: '2024-05-01' },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-semibold text-foreground">Bot Users</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-2xl">Registered Users</CardTitle>
              <CardDescription>A list of users currently utilizing the Calendar Alert Bot.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mockUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Telegram ID</TableHead>
                  <TableHead>Join Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Image 
                        src={`https://placehold.co/40x40.png?text=${user.username.charAt(0).toUpperCase()}`} 
                        alt={`${user.username} avatar`}
                        width={40} 
                        height={40} 
                        className="rounded-full"
                        data-ai-hint="letter avatar"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.telegramId}</TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-10">
              <Image src="https://placehold.co/300x200.png" alt="No users placeholder" width={300} height={200} className="mx-auto rounded-md mb-4" data-ai-hint="empty user list"/>
              <p className="text-muted-foreground">No users have registered yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
