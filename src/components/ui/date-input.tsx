import * as React from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "@/components/zayqa-icons";
import { addDays } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRestaurant } from "@/hooks/use-restaurant";
import { parseHours } from "@/lib/hospitality";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
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
    const mobile = useIsMobile();
    const venue = useRestaurant();
    const [today, setToday] = React.useState<Date>();
    React.useEffect(()=>setToday(new Date()),[]);
    const [internalValue, setInternalValue] = React.useState(String(defaultValue ?? ""));
    const dateValue = value ?? internalValue;
    const selected = dateValue ? parseISO(dateValue) : undefined;
    const minimum = typeof min === "string" && min ? parseISO(min) : undefined;
    const initialMonth = selected ?? minimum;

    const updateValue = (nextValue: string) => {
      if (value === undefined) setInternalValue(nextValue);
      onChange?.({ target: { value: nextValue }, currentTarget: { value: nextValue } } as React.ChangeEvent<HTMLInputElement>);
    };

    const calendar = <>
          <div className="calendar-brand"><span>ZAYQA</span><small>Select a date</small></div>
          <Calendar
            mode="single"
            selected={selected}
            {...(initialMonth ? {defaultMonth: initialMonth} : {})}
            disabled={(date)=>parseHours(venue.hours).closed || (!!minimum && date < minimum)}
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
        </>;
    const start=minimum&&today&&minimum>today?minimum:today;
    const trigger=<Button type="button" variant="outline" disabled={disabled} className="more-dates" aria-label={ariaLabel??"More dates"} aria-required={required} onClick={()=>setOpen(true)}><CalendarIcon/><span>More dates</span></Button>;
    return <div className={cn("date-strip-wrap",className)}>
      <input ref={ref} type="hidden" name={name} value={dateValue} {...props}/>
      <div className="date-strip" role="group" aria-label={ariaLabel??"Choose a date"}>
        {start&&Array.from({length:14},(_,i)=>{const date=addDays(start,i),key=format(date,"yyyy-MM-dd");return <Button key={key} type="button" variant="outline" disabled={disabled||parseHours(venue.hours).closed} aria-pressed={dateValue===key} aria-label={format(date,"EEEE MMMM d yyyy")} className={`date-strip-card ${dateValue===key?"active":""}`} onClick={()=>updateValue(key)}><small>{format(date,"EEE")}</small><strong>{format(date,"d")}</strong><span>{format(date,"MMM")}</span>{i===0&&<small className="earliest-tag">Earliest</small>}</Button>})}
        {mobile?trigger:<Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild>{trigger}</PopoverTrigger><PopoverContent className="zayqa-calendar-popover w-auto p-0" align="end" sideOffset={8}>{calendar}</PopoverContent></Popover>}
      </div>
      {selected&&<span className="date-selection" aria-live="polite">{format(selected,"EEEE, MMMM d, yyyy")}</span>}
      {mobile&&<Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}><DrawerContent className="calendar-bottom-sheet zayqa-calendar-popover"><DrawerTitle className="sr-only">Select a date</DrawerTitle><DrawerDescription className="sr-only">Zayqa Lounge reservation calendar</DrawerDescription>{calendar}</DrawerContent></Drawer>}
    </div>;
  },
);

DateInput.displayName = "DateInput";

export { DateInput };