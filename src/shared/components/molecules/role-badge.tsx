import { EUserRole } from "@/shared/enums/user-role.enum";

interface RoleBadgeProps {
  role: EUserRole;
  variant?: "default" | "outline";
}

const roleConfig = {
  [EUserRole.SUPER_ADMIN]: {
    label: "Super Admin",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    outlineColor: "border-purple-300 text-purple-700",
  },
  [EUserRole.ADMIN]: {
    label: "Administrador",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    outlineColor: "border-blue-300 text-blue-700",
  },
  [EUserRole.INDEPENDIENTE]: {
    label: "Usuario",
    color: "bg-green-100 text-green-800 border-green-200",
    outlineColor: "border-green-300 text-green-700",
  },
  [EUserRole.CLUB_DEPORTIVO]: {
    label: "Club Deportivo",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    outlineColor: "border-yellow-300 text-yellow-700",
  },
  [EUserRole.ENTRENADOR]: {
    label: "Entrenador",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    outlineColor: "border-orange-300 text-orange-700",
  },
};

export function RoleBadge({ role, variant = "default" }: RoleBadgeProps) {
  const config = roleConfig[role];
  const className = variant === "outline" ? config.outlineColor : config.color;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {config.label}
    </span>
  );
}
