"use client";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./form";

interface AuthFormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function AuthFormField({ label, error, required, children }: AuthFormFieldProps) {
  return (
    <FormItem>
      <FormLabel>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </FormLabel>
      <FormControl>
        {children}
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}
