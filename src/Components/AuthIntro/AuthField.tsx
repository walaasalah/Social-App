import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

export const authInputClass =
  "h-[52px] w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60";

export default function AuthField({
  icon: Icon,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon;
  error?: string;
}) {
  const id = props.id ?? props.name;
  return (
    <div>
      <div className="relative">
        <Icon
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-[17px] text-slate-400"
        />
        <input
          {...props}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={authInputClass}
        />
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
