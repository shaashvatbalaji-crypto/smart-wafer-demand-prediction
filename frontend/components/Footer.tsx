import Link from "next/link";
import { footerLinks } from "@/data/navigation";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-black">
      <div className="container-premium py-20 md:py-28">
        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <p className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-white">
              INSIQ
            </p>
            <p className="mt-5 max-w-xs text-[0.9375rem] leading-[1.65] text-muted">
              Smart Wafer Demand Prediction System — AI-powered forecasting for
              the semiconductor industry.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-5 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-white/80">
                {category}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.875rem] text-muted transition-colors duration-300 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="section-divider mt-20 mb-8" />

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-[0.8125rem] text-muted-light">
            &copy; {new Date().getFullYear()} INSIQ. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link
              href="#"
              className="text-[0.8125rem] text-muted-light transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-[0.8125rem] text-muted-light transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
