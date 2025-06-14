import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { SimpleCalendar } from "@/shared/components/organisms/simple-calendar";
import { formatDateSafe, getTodayISO } from "../../utils/date-helpers";
import { DateRangePickerProps } from "../../types/scheduler.types";

export const DateRangePicker = ({
  dateRange,
  hasDateRange,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) => {
  if (!hasDateRange) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="text-lg font-semibold">
            ¿Cuándo quieres reservar?
          </Label>
          {dateRange.from && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {formatDateSafe(dateRange.from)}
            </Badge>
          )}
        </div>
        <SimpleCalendar
          selectedDate={dateRange.from || getTodayISO()}
          onDateChange={onStartDateChange}
        />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Label className="text-lg font-semibold mb-3 block">
          Fecha de inicio
        </Label>
        <SimpleCalendar
          selectedDate={dateRange.from || getTodayISO()}
          onDateChange={onStartDateChange}
        />
      </div>
      <div>
        <Label className="text-lg font-semibold mb-3 block">
          Fecha de finalización
        </Label>
        <SimpleCalendar
          selectedDate={dateRange.to || getTodayISO()}
          onDateChange={onEndDateChange}
        />
      </div>
    </div>
  );
};
