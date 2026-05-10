import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Form-control label. Pair with Input/Textarea/Select via {@code htmlFor} for screen
 * readers. The {@code required} prop adds a red asterisk so users see a visual cue
 * that matches the control's required state.
 */
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </label>
  ),
);
Label.displayName = "Label";
