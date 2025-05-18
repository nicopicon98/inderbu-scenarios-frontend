import { FilterOption } from "@/shared/ui/filter-toolbar";

/** Opciones estáticas para la barra de filtros de Reservas */
export const reservationFilters: FilterOption[] = [
  {
    id: "venue",
    label: "Escenario",
    type: "select",
    placeholder: "Todos los escenarios...",
    options: [{ value: "all", label: "Todos los escenarios..." }],
  },
  {
    id: "neighborhood",
    label: "Barrio",
    type: "select",
    placeholder: "Todos los barrios...",
    options: [{ value: "all", label: "Todos los barrios..." }],
  },
  {
    id: "client",
    label: "Cliente",
    type: "select",
    placeholder: "Todos los clientes...",
    options: [{ value: "all", label: "Todos los clientes..." }],
  },
  {
    id: "dateType",
    label: "Tipo de fecha",
    type: "select",
    placeholder: "Reserva",
    options: [
      { value: "reservation", label: "Reserva" },
      { value: "created", label: "Creado" },
    ],
  },
  { id: "dateFrom", label: "Desde", type: "date" },
  { id: "dateTo", label: "Hasta", type: "date" },
  {
    id: "status",
    label: "Estado",
    type: "select",
    placeholder: "Todos los estados...",
    options: [
      { value: "all", label: "Todos los estados..." },
      { value: "approved", label: "Aprobada" },
      { value: "pending", label: "Pendiente" },
      { value: "rejected", label: "Rechazada" },
    ],
  },
];
