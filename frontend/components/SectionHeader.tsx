"use client";

import { motion } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/animations";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      custom={0}
      variants={fadeUp}
      className={`mb-14 sm:mb-16 md:mb-20 ${isCenter ? "mx-auto max-w-4xl text-center" : "max-w-2xl"}`}
    >
      <p className="text-eyebrow mb-5">{eyebrow}</p>
      <h2 className="text-section-title whitespace-pre-line text-white">
        {title}
      </h2>
      {description && (
        <p className="text-body-large mx-auto mt-6 max-w-2xl md:text-[1.375rem]">
          {description}
        </p>
      )}
    </motion.div>
  );
}
