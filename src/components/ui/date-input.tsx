import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DateInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, onClick, ...props }, ref) => (
    <Input
      {...props}
      ref={ref}
      type="date"
      className={cn("date-input", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) event.currentTarget.showPicker?.();
      }}
    />
  ),
);

DateInput.displayName = "DateInput";

export { DateInput };