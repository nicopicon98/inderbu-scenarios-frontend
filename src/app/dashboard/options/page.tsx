"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { ImageIcon, Settings, Users } from "lucide-react";
import Link from "next/link";

export default function OptionsPage() {
  const optionCategories = [
    {
      id: "content",
      title: "Contenido",
      description: "Gestiona el contenido de la plataforma",
      icon: ImageIcon,
      options: [
        {
          id: "banners",
          title: "Banners",
          description: "Gestiona los banners de las diferentes páginas",
          href: "/opciones/banners",
        },
      ],
    },
    {
      id: "users",
      title: "Usuarios",
      description: "Gestiona los usuarios y permisos",
      icon: Users,
      options: [
        {
          id: "roles",
          title: "Roles y Permisos",
          description: "Configura los roles y permisos de los usuarios",
          href: "/opciones/roles",
        },
        {
          id: "admins",
          title: "Administradores",
          description: "Gestiona los usuarios administradores",
          href: "/opciones/administradores",
        },
      ],
    },
    {
      id: "system",
      title: "Sistema",
      description: "Configuraciones generales del sistema",
      icon: Settings,
      options: [
        {
          id: "notifications",
          title: "Notificaciones",
          description: "Configura las notificaciones del sistema",
          href: "/opciones/notificaciones",
        },
        {
          id: "security",
          title: "Seguridad",
          description: "Configura las opciones de seguridad",
          href: "/opciones/seguridad",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Opciones del Sistema
        </h1>
        <p className="text-muted-foreground">
          Configura y personaliza la plataforma según tus necesidades.
        </p>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          {optionCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-2"
            >
              <category.icon className="h-4 w-4" />
              <span>{category.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {optionCategories.map((category) => (
          <TabsContent
            key={category.id}
            value={category.id}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.options.map((option) => (
                <Link key={option.id} href={option.href}>
                  <Card className="h-full transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
