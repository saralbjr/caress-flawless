import { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Login - Caress&Flawless",
  description: "Login to your Caress&Flawless account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="bg-card shadow-sm border border-border/60 rounded-lg p-8">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
