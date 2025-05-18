"use client";

import { useEffect, useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/shared/ui/drawer";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import axios from "axios";

/* ---------- Tipos ---------- */
export interface IUser {
  id: number;
  dni: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  role: {
    id: number;
    name: string;
    description: string;
  };
  neighborhood: {
    id: number;
    name: string;
  };
  password?: string;
}

interface IRoleOption {
  id: number;
  name: string;
}

interface INeighborhoodOption {
  id: number;
  name: string;
}

interface UserDrawerProps {
  open: boolean;
  user: IUser | null;
  onClose: () => void;
  onSave: (data: Partial<IUser>) => Promise<void>;
}

// API URL base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/* ---------- Componente ---------- */
export function UserDrawer({
  open,
  user,
  onClose,
  onSave,
}: UserDrawerProps) {
  const [form, setForm] = useState<Partial<IUser>>({});
  const [roles, setRoles] = useState<IRoleOption[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<INeighborhoodOption[]>([]);
  const [loading, setLoading] = useState(false);

  /* Cargar roles y barrios */
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // En un entorno real, estos datos vendrían de la API
        // Por ahora usamos datos de ejemplo
        setRoles([
          { id: 1, name: "Administrador" },
          { id: 2, name: "Cliente" },
          { id: 3, name: "Gestor" },
        ]);
        
        setNeighborhoods([
          { id: 1, name: "San Alonso" },
          { id: 2, name: "Provenza" },
          { id: 3, name: "Álvarez Las Americas" },
        ]);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    
    fetchOptions();
  }, []);

  /* Resetea el formulario cada vez que cambie el user */
  useEffect(() => {
    setForm(user ?? {});
  }, [user]);

  /* Helpers */
  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(form);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handle =
    (field: keyof IUser) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value });

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="w-full sm:w-[480px] bg-white">
        <DrawerHeader>
          <DrawerTitle>
            {user ? `Editar Usuario: ${user.firstName} ${user.lastName}` : "Nuevo Usuario"}
          </DrawerTitle>
        </DrawerHeader>

        {/* ---------- Cuerpo scrollable ---------- */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
          {/* Línea 1: DNI + Rol */}
          <div className="grid grid-cols-2 gap-4">
            <Field id="user-dni" label="DNI*">
              <Input 
                value={form.dni || ""} 
                onChange={(e) => setForm({ ...form, dni: Number(e.target.value) })} 
              />
            </Field>

            <Field id="user-role" label="Rol*">
              <Select 
                value={form.role?.id?.toString() || ""} 
                onValueChange={(value) => setForm({ 
                  ...form, 
                  role: { ...form.role, id: Number(value) } 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Línea 2: Nombre + Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <Field id="user-firstName" label="Nombre*">
              <Input
                value={form.firstName || ""}
                onChange={handle("firstName")}
              />
            </Field>

            <Field id="user-lastName" label="Apellido*">
              <Input
                value={form.lastName || ""}
                onChange={handle("lastName")}
              />
            </Field>
          </div>

          {/* Email */}
          <Field id="user-email" label="Email*">
            <Input
              type="email"
              value={form.email || ""}
              onChange={handle("email")}
            />
          </Field>

          {/* Teléfono */}
          <Field id="user-phone" label="Teléfono*">
            <Input
              type="tel"
              value={form.phone || ""}
              onChange={handle("phone")}
            />
          </Field>

          {/* Línea 3: Barrio */}
          <Field id="user-neighborhood" label="Barrio*">
            <Select 
              value={form.neighborhood?.id?.toString() || ""} 
              onValueChange={(value) => setForm({ 
                ...form, 
                neighborhood: { ...form.neighborhood, id: Number(value) } 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar barrio" />
              </SelectTrigger>
              <SelectContent>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood.id} value={neighborhood.id.toString()}>
                    {neighborhood.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Dirección */}
          <Field id="user-address" label="Dirección*">
            <Input
              value={form.address || ""}
              onChange={handle("address")}
            />
          </Field>

          {/* Contraseña (opcional) */}
          <Field id="user-password" label="Contraseña">
            <Input
              type="password"
              placeholder={user ? "Dejar en blanco para mantener la actual" : "Ingrese contraseña"}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>

          {/* Estado */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="user-status">Estado</Label>
            <Switch
              id="user-status"
              checked={form.isActive}
              onCheckedChange={(v) =>
                setForm({ ...form, isActive: v })
              }
            />
          </div>
        </div>

        {/* ---------- Footer ---------- */}
        <DrawerFooter>
          <Button
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>

          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/* ---------- Helper Field ---------- */
function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
