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

/* ---------- Tipos ---------- */
export interface IClient {
  id: string;
  document: string;
  name: string;
  email: string;
  phone: string;
  neighborhood: string;
  address?: string;
  observations?: string;
  status: "active" | "inactive";
  password?: string;
}

interface ClientDrawerProps {
  open: boolean;
  client: IClient | null;
  onClose: () => void;
  onSave: (data: Partial<IClient>) => Promise<void>;
}

/* ---------- Componente ---------- */
export function ClientDrawer({
  open,
  client,
  onClose,
  onSave,
}: ClientDrawerProps) {
  const [form, setForm] = useState<Partial<IClient>>({});

  /* Resetea el formulario cada vez que cambie el cliente */
  useEffect(() => {
    setForm(client ?? {});
  }, [client]);

  /* Helpers */
  const handleSave = async () => {
    if (!client) return;
    await onSave(form);
    onClose();
  };

  const handle =
    (field: keyof IClient) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value });

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="w-full sm:w-[480px]">
        <DrawerHeader>
          <DrawerTitle>
            {client ? `Editar Cliente ${client.name}` : "Editar Cliente"}
          </DrawerTitle>
        </DrawerHeader>

        {/* ---------- Cuerpo scrollable ---------- */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
          {client && (
            <>
              {/* Línea 1: documento + barrio */}
              <div className="grid grid-cols-2 gap-4">
                <Field id="client-doc" label="Documento*">
                  <Input value={form.document ?? ""} readOnly />
                </Field>

                <Field id="client-neighborhood" label="Barrio*">
                  <Input
                    defaultValue={form.neighborhood}
                    onChange={handle("neighborhood")}
                  />
                </Field>
              </div>

              {/* Nombre */}
              <Field id="client-name" label="Nombre*">
                <Input
                  defaultValue={form.name}
                  onChange={handle("name")}
                />
              </Field>

              {/* Email */}
              <Field id="client-email" label="Email*">
                <Input
                  type="email"
                  defaultValue={form.email}
                  onChange={handle("email")}
                />
              </Field>

              {/* Teléfono */}
              <Field id="client-phone" label="Teléfono*">
                <Input
                  type="tel"
                  defaultValue={form.phone}
                  onChange={handle("phone")}
                />
              </Field>

              {/* Dirección */}
              <Field id="client-address" label="Dirección">
                <Input
                  defaultValue={form.address}
                  onChange={handle("address")}
                />
              </Field>

              {/* Observaciones */}
              <Field id="client-obs" label="Observaciones">
                <Textarea
                  rows={3}
                  defaultValue={form.observations}
                  onChange={handle("observations")}
                />
              </Field>

              {/* Contraseña (opcional) */}
              <Field id="client-pass" label="Contraseña">
                <Input
                  type="password"
                  placeholder="Dejar en blanco para mantener la actual"
                  onChange={handle("password" as keyof IClient)}
                />
              </Field>

              {/* Estado */}
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="client-status">Estado</Label>
                <Switch
                  id="client-status"
                  defaultChecked={form.status === "active"}
                  onCheckedChange={(v) =>
                    setForm({ ...form, status: v ? "active" : "inactive" })
                  }
                />
              </div>
            </>
          )}
        </div>

        {/* ---------- Footer ---------- */}
        <DrawerFooter>
          <Button
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={handleSave}
          >
            Guardar
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
