// src/components/AuthModal.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "sonner";
import { decodeJWT } from "../../../lib/utils";

//
// ——————————————————————————————————————————
// Schemas Zod
// ——————————————————————————————————————————
//

const loginSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const registerSchema = z
  .object({
    dni: z.preprocess(
      (v) => Number(v),
      z.number().int().positive({ message: "DNI inválido" })
    ),
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    phone: z.string().min(6, "Teléfono inválido"),
    address: z.string().min(1, "La dirección es requerida"),
    email: z.string().min(1, "El correo es requerido").email("Correo inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe tener una mayúscula")
      .regex(/[a-z]/, "Debe tener una minúscula")
      .regex(/[0-9]/, "Debe tener un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    // terms: z.boolean().refine((v) => v, "Debes aceptar términos"),
    roleId: z.number().int().positive({ message: "Selecciona un rol" }),
    neighborhoodId: z
      .number()
      .int()
      .positive({ message: "Selecciona un barrio" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

const resetSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Correo inválido"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type ResetData = z.infer<typeof resetSchema>;

type Mode = "login" | "register" | "reset";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (id: number, email: string, role: number, token: string) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Forms
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dni: 0,
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      confirmPassword: "",
      // terms: false,
      roleId: 0,
      neighborhoodId: 0,
    },
  });
  const resetForm = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  // Dynamic options
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<
    { id: number; name: string }[]
  >([]);

  useEffect(() => {
    if (mode !== "register") return;
    fetch(`http://localhost:3001/roles`)
      .then((r) => r.json())
      .then((b) => setRoles(b.data))
      .catch(() =>
        toast.error("No se pudieron cargar los roles")
      );
    fetch(`http://localhost:3001/neighborhoods`)
      .then((r) => r.json())
      .then((b) => setNeighborhoods(b.data))
      .catch(() =>
        toast.error("No se pudieron cargar los barrios")
      );
  }, [mode]);

  // Handlers
  const handleLogin = loginForm.handleSubmit(async (data) => {
    try {
      const res = await fetch(`http://localhost:3001/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);
      const token = body.data.access_token;
      const { email, role, sub: id } = decodeJWT(token);
      localStorage.setItem("auth_token", token);
      toast.success("¡Bienvenido! Inicio de sesión correcto");
      onLoginSuccess(id, email, role, token);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "No se pudo iniciar sesión");
    }
  });

  const handleRegister = registerForm.handleSubmit(async (data) => {
    console.log("hey there", data);
    try {
      const { confirmPassword, /*terms*/ ...payload } = data;
      const res = await fetch(`http://localhost:3001/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Error");
      toast.success("Registrado. Revisa tu correo para confirmar tu cuenta");
      setMode("login");
    } catch (err: any) {
      toast.error(err.message || "No se pudo registrar");
    }
  });

  const handleReset = resetForm.handleSubmit(async (data) => {
    try {
      const res = await fetch(`http://localhost:3001/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message);
      }
      toast.success("Correo enviado. Revisa tu bandeja para restablecer tu contraseña");
      setMode("login");
    } catch (err: any) {
      toast.error(err.message || "No se pudo enviar el correo");
    }
  });

  // Render based on mode
  const renderForm = () => {
    if (mode === "login") {
      return (
        <Form {...loginForm}>
          <form onSubmit={handleLogin} className="space-y-4">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="ejemplo@correo.com"
                      disabled={loginForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={loginForm.formState.isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={loginForm.formState.isSubmitting}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between text-sm">
              <Button variant="link" onClick={() => setMode("reset")}>
                ¿Olvidaste tu contraseña?
              </Button>
              <Button variant="link" onClick={() => setMode("register")}>
                Crear cuenta
              </Button>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loginForm.formState.isSubmitting}
            >
              {loginForm.formState.isSubmitting ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </Form>
      );
    }

    if (mode === "register") {
      return (
        <Form {...registerForm}>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4 mb-4">
              <FormField
                control={registerForm.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="123456789"
                        disabled={registerForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John"
                        disabled={registerForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Doe"
                        disabled={registerForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="1234567890"
                        disabled={registerForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123 Main St"
                        disabled={registerForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="ejemplo@correo.com"
                        disabled={registerForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={registerForm.formState.isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0"
                          onClick={() => setShowPassword((v) => !v)}
                          disabled={registerForm.formState.isSubmitting}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={registerForm.formState.isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0"
                          onClick={() => setShowConfirm((v) => !v)}
                          disabled={registerForm.formState.isSubmitting}
                        >
                          {showConfirm ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      disabled={registerForm.formState.isSubmitting}
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white cursor-pointer max-h-[200px]">
                        {roles.map((r) => (
                          <SelectItem
                            key={r.id}
                            value={String(r.id)}
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="neighborhoodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barrio</FormLabel>
                    <Select
                      disabled={registerForm.formState.isSubmitting}
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un barrio…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white cursor-pointer max-h-[200px]">
                        {neighborhoods.map((n) => (
                          <SelectItem
                            key={n.id}
                            value={String(n.id)}
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            {n.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <FormField
              control={registerForm.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={registerForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormLabel>
                    Acepto{" "}
                    <Link href="/terms">
                      <u>términos y condiciones</u>
                    </Link>
                  </FormLabel>
                </FormItem>
              )}
            /> */}
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              disabled={registerForm.formState.isSubmitting}
            >
              {registerForm.formState.isSubmitting ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Registrarse"
              )}
            </Button>
            <div className="text-center text-sm">
              ¿Ya tienes cuenta?{" "}
              <Button variant="link" onClick={() => setMode("login")}>
                Inicia sesión
              </Button>
            </div>
          </form>
        </Form>
      );
    }

    if (mode === "reset") {
      return (
        <Form {...resetForm}>
          <form onSubmit={handleReset} className="space-y-4">
            <FormField
              control={resetForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="tu@correo.com"
                      disabled={resetForm.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between text-sm">
              <Button variant="link" onClick={() => setMode("login")}>
                Volver a login
              </Button>
              <Button variant="link" onClick={() => setMode("register")}>
                Crear cuenta
              </Button>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={resetForm.formState.isSubmitting}
            >
              {resetForm.formState.isSubmitting ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Enviar enlace"
              )}
            </Button>
          </form>
        </Form>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>
            {mode === "login"
              ? "Iniciar sesión"
              : mode === "register"
              ? "Crear cuenta"
              : "Restablecer contraseña"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Ingresa tus credenciales"
              : mode === "register"
              ? "Completa tus datos"
              : "Te enviaremos un enlace por correo"}
          </DialogDescription>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
