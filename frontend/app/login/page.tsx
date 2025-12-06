'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap } from 'lucide-react';
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/lib/validation';

export default function LoginPage() {
  const { login, register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setError('');
    setIsLoading(true);

    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setError('');
    setIsLoading(true);

    try {
      await registerUser(data.email, data.password, data.name, 'admin');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">i-eSchool Admin</CardTitle>
          <CardDescription>Sign in to manage your school</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="admin@eschool.com"
                    {...loginForm.register('email')}
                    disabled={isLoading}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                    disabled={isLoading}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    {...registerForm.register('name')}
                    disabled={isLoading}
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="admin@eschool.com"
                    {...registerForm.register('email')}
                    disabled={isLoading}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerForm.register('password')}
                    disabled={isLoading}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-muted-foreground text-center">
          <p>Demo credentials for testing:</p>
          <p className="font-mono text-xs">Email: admin@eschool.com | Password: admin123</p>
        </CardFooter>
      </Card>
    </div>
  );
}
