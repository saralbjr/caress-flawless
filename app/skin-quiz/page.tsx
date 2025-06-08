import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Import the QuizForm component with dynamic loading to handle client-side rendering
const QuizForm = dynamic(() => import("@/components/skin-quiz/QuizForm"), {
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
});

export const metadata: Metadata = {
  title: "Skin Analysis Quiz - Caress&Flawless",
  description:
    "Take our skin analysis quiz to get personalized skincare product recommendations",
};

export default function SkinQuizPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Skin Analysis Quiz
          </h1>
          <p className="text-lg text-muted-foreground">
            Answer a few questions about your skin to receive personalized
            product recommendations tailored to your unique needs.
          </p>
        </div>

        <Suspense fallback={<div>Loading quiz...</div>}>
          <QuizForm />
        </Suspense>
      </div>
    </div>
  );
}
