"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    setResult({});

    try {
      const response = await fetch("/api/seed/admin");
      const data = await response.json();

      setResult({
        success: data.success,
        message: data.success ? data.message : undefined,
        error: data.success ? undefined : data.error || "Failed to create admin user",
      });
    } catch (error) {
      setResult({
        success: false,
        error: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Admin Setup
          </CardTitle>
          <CardDescription>
            Create an admin user for the ShopNest admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Admin Credentials</h3>
            <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
              <div className="font-medium">Email:</div>
              <div>admin@shopnest.com</div>
              <div className="font-medium">Password:</div>
              <div>admin123</div>
            </div>
          </div>

          {result.success !== undefined && (
            <Alert
              variant={result.success ? "default" : "destructive"}
              className={result.success ? "border-green-500 text-green-700 dark:text-green-400" : ""}
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.success ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>
                {result.success ? result.message : result.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            onClick={handleCreateAdmin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Admin User...
              </>
            ) : (
              "Create Admin User"
            )}
          </Button>
          
          {result.success && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
