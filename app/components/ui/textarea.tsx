import * as React from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  isEditable: boolean;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isEditable, ...props }, ref) => {
    return isEditable ? (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    ) : (
      <p className="text-gray-900 my-[8px] ml-2 min-h-[60px] text-sm">
        {props.value || props.defaultValue}
      </p>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
