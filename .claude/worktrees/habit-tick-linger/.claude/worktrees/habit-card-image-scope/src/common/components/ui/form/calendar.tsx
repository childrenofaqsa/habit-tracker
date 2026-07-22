import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/lib/cn";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      animate
      classNames={{
        today: "font-bold text-primary",
        selected: "bg-primary text-primary-foreground rounded-md",
        chevron: "fill-foreground",
      }}
      {...props}
    />
  );
}

export { Calendar };
