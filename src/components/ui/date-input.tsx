import * as React from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value"> & {
  value?: string;
};

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, defaultValue, min, onChange, name, required, disabled, "aria-label": ariaLabel, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(String(defaultValue ?? ""));
    const dateValue = value ?? internalValue;
    const selected = dateValue ? parseISO(dateValue) : undefined;
    const minimum = typeof min === "string" && min ? parseISO(min) : undefined;

    const updateValue = (nextValue: string) => {
      if (value === undefined) setInternalValue(nextValue);
      onChange?.({ target: { value: nextValue }, currentTarget: { value: nextValue } } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <input ref={ref} type="hidden" name={name} value={dateValue} {...props} />
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={ariaLabel ?? "Choose date"}
            aria-required={required}
            className={cn("date-input", !dateValue && "date-input-empty", className)}
          >
            <span>{selected ? format(selected, "EEEE, MMMM d, yyyy") : "Choose a date"}</span>
            <CalendarDays aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="zayqa-calendar-popover w-auto p-0" align="start" sideOffset={8}>
          <div className="calendar-brand"><span>ZAYQA</span><small>Select a date</small></div>
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? minimum}
            disabled={minimum ? { before: minimum } : undefined}
            onSelect={(date) => {
              if (!date) return;
              updateValue(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
            className="pointer-events-auto"
            buttonVariant="ghost"
          />
          <div className="calendar-actions">
            <Button type="button" variant="text" size="sm" onClick={() => updateValue("")} disabled={!dateValue}>Clear</Button>
            <Button
              type="button"
              variant="text"
              size="sm"
              onClick={() => {
                const today = new Date();
                const next = minimum && today < minimum ? minimum : today;
                updateValue(format(next, "yyyy-MM-dd"));
                setOpen(false);
              }}
            >Today</Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

DateInput.displayName = "DateInput";

export { DateInput };