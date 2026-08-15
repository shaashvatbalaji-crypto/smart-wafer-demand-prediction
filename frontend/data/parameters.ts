import {
  Building2,
  Tag,
  DollarSign,
  FlaskConical,
  HardDrive,
  Brain,
  TrendingUp,
  Car,
  Smartphone,
  Package,
  Truck,
  Globe,
  Cpu,
  Circle,
  CheckCircle,
  Gauge,
  Expand,
  MapPin,
  type LucideIcon,
} from "lucide-react";

export interface Parameter {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const parameters: Parameter[] = [
  {
    icon: Building2,
    title: "Company Type",
    description:
      "Classifies the organization as fabless, IDM, foundry, or OSAT to tailor prediction models to operational context.",
  },
  {
    icon: Tag,
    title: "Company Name",
    description:
      "Identifies the specific semiconductor company for personalized forecasting and historical trend analysis.",
  },
  {
    icon: DollarSign,
    title: "Revenue",
    description:
      "Annual revenue figures that reflect market scale and purchasing power for wafer procurement planning.",
  },
  {
    icon: FlaskConical,
    title: "R&D Spending",
    description:
      "Research and development investment indicating innovation pipeline intensity and future chip demand.",
  },
  {
    icon: HardDrive,
    title: "CapEx",
    description:
      "Capital expenditure on fabrication and equipment, signaling capacity build-out and wafer volume needs.",
  },
  {
    icon: Brain,
    title: "AI Demand Index",
    description:
      "Composite metric tracking AI accelerator and GPU demand driving advanced node wafer consumption.",
  },
  {
    icon: TrendingUp,
    title: "Semiconductor Market Growth",
    description:
      "Industry-wide growth rate providing macroeconomic context for wafer demand projections.",
  },
  {
    icon: Car,
    title: "Automotive Growth",
    description:
      "Automotive sector expansion reflecting increased chip content in EVs and autonomous systems.",
  },
  {
    icon: Smartphone,
    title: "Consumer Electronics Growth",
    description:
      "Consumer device market momentum affecting mobile, wearable, and home electronics chip demand.",
  },
  {
    icon: Package,
    title: "Inventory Level",
    description:
      "Current wafer and chip inventory status to detect overstock risks or supply shortages early.",
  },
  {
    icon: Truck,
    title: "Supply Chain Index",
    description:
      "Supply chain health score capturing logistics efficiency, lead times, and vendor reliability.",
  },
  {
    icon: Globe,
    title: "Geopolitical Risk",
    description:
      "Risk assessment of trade policies, sanctions, and regional tensions impacting wafer supply.",
  },
  {
    icon: Cpu,
    title: "Technology Node",
    description:
      "Process node specification (e.g., 3nm, 5nm) determining wafer complexity and foundry requirements.",
  },
  {
    icon: Circle,
    title: "Wafer Size",
    description:
      "Wafer diameter (200mm, 300mm) affecting production capacity and cost per die calculations.",
  },
  {
    icon: CheckCircle,
    title: "Yield",
    description:
      "Manufacturing yield percentage indicating effective output and gross wafer start requirements.",
  },
  {
    icon: Gauge,
    title: "Fab Utilization",
    description:
      "Fabrication plant utilization rate revealing capacity constraints and production bottlenecks.",
  },
  {
    icon: Expand,
    title: "Capacity Expansion",
    description:
      "Planned fab expansion projects and timeline for new capacity coming online.",
  },
  {
    icon: MapPin,
    title: "Region",
    description:
      "Geographic region of operations influencing supply chain dynamics and local market demand.",
  },
];
