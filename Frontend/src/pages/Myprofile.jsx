import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, ShieldCheck, Edit, Save, KeyRound, Bell, Trash2, ShieldAlert } from 'lucide-react';
import usercontext from '@/context/usercontext';

// Import required shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Helper function to get initials from a name
const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return '?';
  const names = name.trim().split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return `${names[0][0]}`.toUpperCase();
};

// Helper to format the role string
const formatRole = (role = '') => {
  if (!role) return 'Not Assigned';
  return role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, ' $1').trim();
};

export default function MyProfilePage() {
  const { userData } = useContext(usercontext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  // Sync form data with userData from context when it loads
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = () => {
    // Here you would typically call an API to update user data
    console.log('Saving data:', formData);
    setIsEditing(false);
    // You might want to update the context's userData as well
  };
  
  // A mock joined date for display purposes
  const joinedDate = "October 3, 2025";

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-slate-950 text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-28 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white">Account Settings</h1>
          <p className="text-lg text-slate-400 mt-2">Manage your personal information and security settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-2 ring-blue-500 ring-offset-4 ring-offset-slate-900">
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                <p className="text-slate-400">{userData.email}</p>
                <Badge variant="secondary" className="mt-4 bg-blue-500/10 text-blue-300 border-blue-500/20">
                  {formatRole(userData.role)}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white text-xl">Personal Information</CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)} className="border-slate-700 hover:bg-slate-800">
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-white space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="bg-slate-800 border-slate-700 focus:ring-blue-500" />
                  </div>
                  <div className="text-white space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} disabled className="bg-slate-700 border-slate-600 cursor-not-allowed" />
                  </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div  className="text-white space-y-2">
                    <Label>Role</Label>
                    <p className="text-slate-300 font-medium p-2">{formatRole(userData.role)}</p>
                  </div>
                   <div className="text-white space-y-2">
                    <Label>Joined On</Label>
                    <p className="text-slate-300 font-medium p-2">{joinedDate}</p>
                  </div>
                </div>
              </CardContent>
              {isEditing && (
                <CardFooter className="bg-slate-900/50 border-t border-slate-800 px-6 py-4">
                  <Button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                </CardFooter>
              )}
            </Card>

            {/* Security Settings Card */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-xl">Security Settings</CardTitle>
                <CardDescription>Keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                  <div>
                    <h3 className="font-semibold text-white">Change Password</h3>
                    <p className="text-sm text-slate-400">It's a good idea to use a strong password.</p>
                  </div>
                  <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                    <KeyRound className="mr-2 h-4 w-4" /> Change
                  </Button>
                </div>
                <Separator className="bg-slate-800" />
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold text-white">Two-Factor Authentication (2FA)</h3>
                    <p className="text-sm text-slate-400">Add an extra layer of security to your account.</p>
                  </div>
                  <Switch id="2fa-switch" className="data-[state=checked]:bg-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            {/* Danger Zone */}
            <Card className="bg-slate-900 border-red-500/30">
                <CardHeader>
                    <CardTitle className="text-xl text-red-400 flex items-center gap-2"><ShieldAlert className="h-5 w-5"/>Danger Zone</CardTitle>
                    <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-800 border-slate-700 hover:bg-slate-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

