import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Select({
  className,
  label,
  helperText,
  error,
  id,
  children,
  ...props
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const helperId = helperText ? `${selectId}-helper` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium leading-none text-foreground">
          {label}
        </label>
      ) : null}
      <Select
        id={selectId}
        aria-describedby={errorId ?? helperId}
        aria-invalid={!!error}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring",
          error ? "border-rose-400 focus-visible:ring-rose-300" : "",
          className
        )}
        {...props}
      >
        {children}
      </Select>
      {helperText && !error ? (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
