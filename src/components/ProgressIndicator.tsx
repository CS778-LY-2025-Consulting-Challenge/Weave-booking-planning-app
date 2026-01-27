'use client';

import { CheckCircle, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StepStatus = 'pending' | 'loading' | 'completed';

export interface ProgressStep {
  id: number;
  label: string;
  status: StepStatus;
  estimatedDuration?: number;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  className?: string;
}

export default function ProgressIndicator({ steps, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          {/* Dynamic Icon */}
          {step.status === 'completed' && (
            <CheckCircle className="size-5 flex-shrink-0 text-green-500" />
          )}
          {step.status === 'loading' && (
            <Loader2 className="size-5 flex-shrink-0 text-blue-500 animate-spin" />
          )}
          {step.status === 'pending' && (
            <Circle className="size-5 flex-shrink-0 text-gray-300" />
          )}
          
          {/* Dynamic Text */}
          <span
            className={cn(
              "text-sm transition-all duration-300",
              step.status === 'completed' && "text-green-700 font-medium",
              step.status === 'loading' && "text-blue-700 font-semibold animate-pulse",
              step.status === 'pending' && "text-gray-400"
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
