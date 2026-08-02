import type { ReactNode } from "react";

/**
 * Drop-in replacements for the public site PageShell/PageHeader inside the
 * unified /admin layout — the layout route already renders the site header,
 * sidebar, and footer.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return <div className="pb-12">{children}</div>;
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
    <div className="border-b border-hairline pb-6">
      {eyebrow ? (
        <span className="inline-flex w-fit items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-brand uppercase ring-1 ring-brand/20">
          {eyebrow}
        </span>
      ) : null}
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-surface ring-1 ring-hairline ${className}`}>{children}</div>;
}