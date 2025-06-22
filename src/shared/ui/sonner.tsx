"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-green-600 group-[.toaster]:text-white group-[.toaster]:border-green-600",
          error:
            "group-[.toaster]:bg-red-600 group-[.toaster]:text-white group-[.toaster]:border-red-600",
          warning:
            "group-[.toaster]:bg-yellow-600 group-[.toaster]:text-white group-[.toaster]:border-yellow-600",
          info:
            "group-[.toaster]:bg-blue-600 group-[.toaster]:text-white group-[.toaster]:border-blue-600",
        },
      }}
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  );
};

export { Toaster };
