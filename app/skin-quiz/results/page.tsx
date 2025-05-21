"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Alert, Button } from "antd";
import { useRouter } from "next/navigation";

// Import the ResultsDisplay component with dynamic loading
const ResultsDisplay = dynamic(
  () => import("@/components/skin-quiz/ResultsDisplay"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-2.5"></div>
          <div className="h-4 bg-gray-200 rounded w-80 mb-2.5"></div>
        </div>
      </div>
    ),
  }
);

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("id");
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);
  }, []);

  // If no analysis ID is provided, redirect to the quiz page
  useEffect(() => {
    if (!analysisId) {
      router.push("/skin-quiz");
    }
  }, [analysisId, router]);

  if (isAuthenticated === false) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Alert
            message="Authentication Required"
            description="Please log in to view your skin analysis results."
            type="warning"
            showIcon
            action={
              <Button
                type="primary"
                onClick={() => router.push("/login?redirect=/skin-quiz")}
              >
                Log In
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (!analysisId) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Alert
            message="No Analysis Found"
            description="No skin analysis ID was provided. Please take the quiz to get your personalized recommendations."
            type="info"
            showIcon
            action={
              <Button type="primary" onClick={() => router.push("/skin-quiz")}>
                Take Quiz
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <Suspense fallback={<div>Loading results...</div>}>
          <ResultsDisplay analysisId={analysisId} />
        </Suspense>
      </div>
    </div>
  );
}
