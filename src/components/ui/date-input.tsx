import * as React from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DateInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, onClick, ...props }, ref) => (
    <span className="date-input-wrap">
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
      <CalendarDays aria-hidden="true" />
    </span>
  ),
);

DateInput.displayName = "DateInput";

export { DateInput };