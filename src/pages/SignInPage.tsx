import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const SignInPage = () => {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    try {
      setIsLoading(true);
      setUserEmail(values.email);
      await login(values.email, values.password);
      toast.success("Signed in successfully");
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in. Please  check your credentials.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      // Pass the user's email to the resendVerification function
      await resendVerification(userEmail);
      // Toast is now shown in the resendVerification function
    } catch (error) {
      toast.error("Failed to send verification email");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-garage-blue"
                >
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path d="M5.5 17.5L8 14h4l2 3h3" />
                  <path d="M18.5 17.5L16 14l-3-3-1-3" />
                  <path d="M6.5 10.5h3" />
                  <path d="M14 10.5h3l3 3" />
                </svg>
                <h1 className="text-2xl font-bold text-garage-blue">Saiku Rentals</h1>
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-garage-blue hover:bg-garage-blue/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don't have an account? {" "}
              <Link to="/signup" className="text-garage-blue hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignInPage;
