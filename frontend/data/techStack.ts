export interface TechItem {
  name: string;
  category: string;
  color: string;
}

export const techStack: TechItem[] = [
  { name: "Python", category: "Backend", color: "#3776AB" },
  { name: "CatBoost", category: "ML Engine", color: "#FFCC00" },
  { name: "MySQL", category: "Database", color: "#4479A1" },
  { name: "Next.js", category: "Framework", color: "#FFFFFF" },
  { name: "React", category: "UI Library", color: "#61DAFB" },
  { name: "Tailwind", category: "Styling", color: "#06B6D4" },
  { name: "Framer Motion", category: "Animation", color: "#BB4BD9" },
];
