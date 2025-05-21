"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  
  // Select the appropriate schema based on mode
  const schema = mode === "login" ? loginSchema : signupSchema;
  
  // Initialize the form
  const form = useForm<LoginFormValues | SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: mode === "login" 
      ? { email: "", password: "" }
      : { name: "", email: "", password: "" },
  });
  
  const onSubmit = async (data: LoginFormValues | SignupFormValues) => {
    setIsLoading(true);
    
    try {
      // Determine the API endpoint based on the form mode
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      
      // Send the request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Important for cookies
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Show error notification
        toast.error(
          result.error || 
          `Failed to ${mode === "login" ? "log in" : "sign up"}. Please try again.`
        );
        return;
      }
      
      // Store user data in localStorage
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }
      
      // Show success notification
      toast.success(
        mode === "login" 
          ? "Logged in successfully!" 
          : "Account created successfully!"
      );
      
      // Redirect to the specified redirect URL or home page
      router.push(redirect);
      router.refresh();
    } catch (error) {
      console.error(`${mode} error:`, error);
      toast.error(
        `An error occurred. Please try again later.`
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name field (only for signup) */}
        {mode === "signup" && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Email field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Password field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "login" ? "Login" : "Sign Up"}
        </Button>
        
        {/* Link to alternate auth form */}
        <div className="text-center text-sm">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          )}
        </div>
      </form>
    </Form>
  );
}