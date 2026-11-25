import type { ReactNode } from "react";

export function CvStudioFormField({
  label, required, hint, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-slate-800">
        {label}{required ? " *" : ""}
      </span>
      {children}
      {hint && <span className="block text-xs leading-5 text-slate-500">{hint}</span>}
    </label>
  );
}
