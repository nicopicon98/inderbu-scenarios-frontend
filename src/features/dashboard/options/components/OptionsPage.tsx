"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import Link from "next/link";
import { OptionsDataResponse } from "../application/GetOptionsDataUseCase";

interface OptionsPageProps {
  initialData: OptionsDataResponse;
}

export function OptionsPage({ initialData }: OptionsPageProps) {
  const { categories } = initialData;

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
          {categories.map((category) => (
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

        {categories.map((category) => (
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
