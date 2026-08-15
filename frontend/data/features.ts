import {
  LineChart,
  History,
  LayoutDashboard,
  GitCompare,
  Search,
  BarChart3,
  Database,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: LineChart,
    title: "Prediction",
    description:
      "AI-powered wafer demand forecasts with multi-horizon projections and scenario modeling.",
  },
  {
    icon: History,
    title: "History",
    description:
      "Complete audit trail of past predictions, inputs, and outcomes for trend analysis.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Real-time executive dashboard with KPIs, charts, and demand signals at a glance.",
  },
  {
    icon: GitCompare,
    title: "Comparison",
    description:
      "Side-by-side comparison of predictions across companies, regions, and time periods.",
  },
  {
    icon: Search,
    title: "Search",
    description:
      "Powerful search across predictions, companies, and parameters with instant filtering.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Deep analytics with trend decomposition, correlation analysis, and demand drivers.",
  },
  {
    icon: Database,
    title: "Database",
    description:
      "Centralized data repository for semiconductor market intelligence and company profiles.",
  },
  {
    icon: ShieldCheck,
    title: "Confidence Score",
    description:
      "Model confidence metrics with uncertainty bands to support risk-aware decisions.",
  },
];
