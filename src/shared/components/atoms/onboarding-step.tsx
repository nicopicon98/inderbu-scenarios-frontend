import { CheckCircle2 } from "lucide-react";

interface OnboardingStepProps {
  step: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
}

export const OnboardingStep = ({ 
  step, 
  title, 
  description, 
  isActive, 
  isCompleted 
}: OnboardingStepProps) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
    isActive ? "bg-blue-50 border-l-4 border-blue-500" : 
    isCompleted ? "bg-green-50 border-l-4 border-green-500" :
    "bg-gray-50 border-l-4 border-gray-200"
  }`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
      isCompleted ? "bg-green-500 text-white" :
      isActive ? "bg-blue-500 text-white" :
      "bg-gray-300 text-gray-600"
    }`}>
      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : step}
    </div>
    <div>
      <h4 className={`font-medium ${isActive ? "text-blue-900" : isCompleted ? "text-green-900" : "text-gray-600"}`}>
        {title}
      </h4>
      <p className={`text-sm ${isActive ? "text-blue-700" : isCompleted ? "text-green-700" : "text-gray-500"}`}>
        {description}
      </p>
    </div>
  </div>
);
