import {
  FileInput,
  Sparkles,
  Microscope,
  Lightbulb,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface WorkflowStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const workflowSteps: WorkflowStep[] = [
  {
    icon: FileInput,
    title: "Input",
    description: "Enter company data and market parameters",
  },
  {
    icon: Sparkles,
    title: "Prediction",
    description: "AI model generates wafer demand forecast",
  },
  {
    icon: Microscope,
    title: "Analysis",
    description: "Deep dive into trends and drivers",
  },
  {
    icon: Lightbulb,
    title: "Business Insight",
    description: "Actionable intelligence for stakeholders",
  },
  {
    icon: Target,
    title: "Decision Making",
    description: "Strategic procurement and capacity planning",
  },
];
