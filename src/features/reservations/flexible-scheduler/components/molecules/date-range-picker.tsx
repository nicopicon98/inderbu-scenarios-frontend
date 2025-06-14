import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { SimpleCalendar } from "@/shared/components/organisms/simple-calendar";
import { formatDateSafe, getTodayISO, getNextDay } from "../../utils/date-helpers";
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
        <div className="flex items-center gap-2 mb-3">
          <Label className="text-lg font-semibold">
            Fecha de inicio
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
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="text-lg font-semibold">
            Fecha de finalización
          </Label>
          {!dateRange.from && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Selecciona fecha de inicio primero
            </Badge>
          )}
          {dateRange.from && dateRange.to && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {formatDateSafe(dateRange.to)}
            </Badge>
          )}
        </div>
        {dateRange.from && (
          <div className="mb-2 text-sm text-gray-600">
            <span>Debe ser posterior al {formatDateSafe(dateRange.from)}</span>
            {!dateRange.to && (
              <span className="text-green-600 ml-2">
                • Sugerencia: {formatDateSafe(getNextDay(dateRange.from))}
              </span>
            )}
          </div>
        )}
        <SimpleCalendar
          selectedDate={dateRange.to || (dateRange.from ? getNextDay(dateRange.from) : getTodayISO())}
          onDateChange={onEndDateChange}
          minDate={dateRange.from} // No permitir fechas <= fecha inicial
        />
      </div>
    </div>
  );
};
