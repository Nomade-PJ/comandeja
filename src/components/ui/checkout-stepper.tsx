import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type CheckoutStep = {
  id: number;
  name: string;
  status: "complete" | "current" | "upcoming";
};

interface CheckoutStepperProps {
  steps: CheckoutStep[];
  currentStep: number;
}

export function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li 
            key={step.id} 
            className={cn(
              stepIdx !== steps.length - 1 ? "flex-1" : "",
              "relative"
            )}
          >
            {step.status === "complete" ? (
              <div className="group">
                <span className="flex items-center">
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                  <span className="ml-3 text-sm font-medium">{step.name}</span>
                </span>
                {stepIdx !== steps.length - 1 ? (
                  <span className="absolute left-4 top-4 -ml-px mt-0.5 h-0.5 w-full bg-primary" aria-hidden="true"></span>
                ) : null}
              </div>
            ) : step.status === "current" ? (
              <div className="group" aria-current="step">
                <span className="flex items-center">
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                  </span>
                  <span className="ml-3 text-sm font-medium text-primary">{step.name}</span>
                </span>
                {stepIdx !== steps.length - 1 ? (
                  <span className="absolute left-4 top-4 -ml-px mt-0.5 h-0.5 w-full bg-gray-200" aria-hidden="true"></span>
                ) : null}
              </div>
            ) : (
              <div className="group">
                <span className="flex items-center">
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent"></span>
                  </span>
                  <span className="ml-3 text-sm font-medium text-gray-500">{step.name}</span>
                </span>
                {stepIdx !== steps.length - 1 ? (
                  <span className="absolute left-4 top-4 -ml-px mt-0.5 h-0.5 w-full bg-gray-200" aria-hidden="true"></span>
                ) : null}
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 