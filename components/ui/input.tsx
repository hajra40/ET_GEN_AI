import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium leading-none text-foreground">
            {label}
          </label>
        ) : null}
        <Input
          type={type}
          id={inputId}
          ref={ref}
          aria-describedby={errorId ?? helperId}
          aria-invalid={!!error}
          className={cn(
            "flex h-11 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            error ? "border-rose-400 focus-visible:ring-rose-300" : "",
            className
          )}
          {...props}
        />
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
);

Input.displayName = "Input";
