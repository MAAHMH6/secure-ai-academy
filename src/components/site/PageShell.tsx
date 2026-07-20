import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-hairline py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {eyebrow ? (
          <span className="inline-flex w-fit items-center rounded-full bg-brand/10 px-3 py-1 text-[11px] font-medium tracking-wider text-brand uppercase ring-1 ring-brand/20">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-6 max-w-[22ch] text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-[60ch] text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}