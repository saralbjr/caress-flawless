import { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign Up - Caress&Flawless",
  description: "Create a new Caress&Flawless account",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">
            Sign up to start shopping with ShopNest
          </p>
        </div>

        <div className="bg-card shadow-sm border border-border/60 rounded-lg p-8">
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
}
