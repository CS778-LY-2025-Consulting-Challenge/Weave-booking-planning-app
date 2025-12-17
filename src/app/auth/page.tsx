'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Chrome, Facebook, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Auth() {
  const { setIsAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting auth form...');
    // Save user info to localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    if (name) {
      localStorage.setItem('userName', name);
    }
    console.log('localStorage set, calling setIsAuthenticated(true)');
    // Set authentication state
    setIsAuthenticated(true);
    console.log('Navigating to dashboard...');
    // Small delay to ensure state updates before navigation
    setTimeout(() => {
      router.push('/dashboard');
    }, 100);
  };

  const handleSocialLogin = (provider: string) => {
    console.log('Social login with:', provider);
    // Simulate social login
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', `user@${provider}.com`);
    localStorage.setItem('userName', `${provider} User`);
    console.log('localStorage set, calling setIsAuthenticated(true)');
    // Set authentication state
    setIsAuthenticated(true);
    console.log('Navigating to dashboard...');
    // Small delay to ensure state updates before navigation
    setTimeout(() => {
      router.push('/dashboard');
    }, 100);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-16">
      <div className="w-full max-w-md px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome to Weave</CardTitle>
            <CardDescription>
              Sign in or create an account to start your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-6">
              <Separator />
              <p className="mx-auto -mt-3 w-fit bg-white px-2 text-center text-sm text-gray-500">
                Or continue with
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('google')}
              >
                <Chrome className="mr-2 size-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('facebook')}
              >
                <Facebook className="mr-2 size-4" />
                Facebook
              </Button>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('phone')}
              >
                <Phone className="mr-2 size-4" />
                Continue with Phone
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}