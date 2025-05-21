'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Steps, Button, message, Card } from 'antd';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

import QuizStepOne from './QuizStepOne';
import QuizStepTwo from './QuizStepTwo';
import QuizStepThree from './QuizStepThree';

// Define the schema for the entire form
const quizSchema = z.object({
  // Step 1: Skin Type
  skinType: z.enum(['dry', 'oily', 'combination', 'sensitive', 'normal']),
  
  // Step 2: Skin Concerns
  skinConcerns: z.array(z.string()).min(1, 'Please select at least one skin concern'),
  
  // Step 3: Routine Preferences
  routinePreferences: z.object({
    currentProducts: z.array(z.string()).optional(),
    preferredIngredients: z.array(z.string()).optional(),
    avoidIngredients: z.array(z.string()).optional(),
    budget: z.enum(['low', 'medium', 'high']).default('medium'),
    routineComplexity: z.enum(['simple', 'moderate', 'comprehensive']).default('moderate'),
  }),
  
  // Store all individual question responses
  quizResponses: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.array(z.string())]),
    })
  ).default([]),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function QuizForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Initialize the form
  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      skinType: undefined,
      skinConcerns: [],
      routinePreferences: {
        currentProducts: [],
        preferredIngredients: [],
        avoidIngredients: [],
        budget: 'medium',
        routineComplexity: 'moderate',
      },
      quizResponses: [],
    },
    mode: 'onChange',
  });
  
  const { handleSubmit, trigger, getValues, formState: { errors, isValid } } = methods;
  
  // Handle next step
  const handleNext = async () => {
    // Validate the current step
    let isStepValid = false;
    
    if (currentStep === 0) {
      isStepValid = await trigger('skinType');
    } else if (currentStep === 1) {
      isStepValid = await trigger('skinConcerns');
    } else {
      isStepValid = await trigger('routinePreferences');
    }
    
    if (isStepValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Show error message
      toast.error('Please complete all required fields before proceeding.');
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Handle form submission
  const onSubmit = async (data: QuizFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/skin-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit quiz');
      }
      
      // Show success message
      toast.success('Skin analysis completed successfully!');
      
      // Redirect to results page
      router.push(`/skin-quiz/results?id=${result.skinAnalysisId}`);
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <QuizStepOne />;
      case 1:
        return <QuizStepTwo />;
      case 2:
        return <QuizStepThree />;
      default:
        return null;
    }
  };
  
  return (
    <FormProvider {...methods}>
      <Card className="w-full max-w-4xl mx-auto shadow-md">
        <Steps
          current={currentStep}
          items={[
            { title: 'Skin Type', description: 'Identify your skin type' },
            { title: 'Skin Concerns', description: 'Select your concerns' },
            { title: 'Preferences', description: 'Your routine preferences' },
          ]}
          className="mb-8"
        />
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button 
                type="default" 
                onClick={handlePrevious}
                icon={<ArrowLeft className="h-4 w-4 mr-2" />}
              >
                Previous
              </Button>
            )}
            
            {currentStep < 2 ? (
              <Button 
                type="primary" 
                onClick={handleNext}
                className="ml-auto"
                icon={<ArrowRight className="h-4 w-4 ml-2" />}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="primary" 
                htmlType="submit"
                loading={isSubmitting}
                className="ml-auto"
                icon={<Check className="h-4 w-4 mr-2" />}
              >
                Complete Quiz
              </Button>
            )}
          </div>
        </form>
      </Card>
    </FormProvider>
  );
}
