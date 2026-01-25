'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

export interface TutorialStep {
  stepNumber: number | null;
  elementId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: (steps: TutorialStep[]) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepNumber: number) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);

  const startTutorial = (tutorialSteps: TutorialStep[]) => {
    // Фильтруем и сортируем шаги
    const filteredSteps = tutorialSteps
      .filter(step => step.stepNumber !== null)
      .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0));
    
    setSteps(filteredSteps);
    setCurrentStep(0);
    setIsActive(true);
  };

  const stopTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      stopTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber: number) => {
    const stepIndex = steps.findIndex(step => step.stepNumber === stepNumber);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTutorial,
        stopTutorial,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}