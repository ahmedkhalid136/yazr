import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  isEditable?: boolean;
  display?: string;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, isEditable = true, type, ...props }, ref) => {
    return isEditable ? (
      <input
        type={type}
        className={cn(
          "flex min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    ) : (
      <p className={cn("text-gray-900 my-[8px]  min-h-5 text-sm", className)}>
        {props.display || props.value || props.defaultValue}
      </p>
    );
  },
);
Input.displayName = "Input";

export { Input };
