"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showPassword?: boolean;
  onToggleVisibility?: () => void;
}

export function PasswordInput({ 
  showPassword = false, 
  onToggleVisibility,
  ...props 
}: PasswordInputProps) {
  const [internalShow, setInternalShow] = useState(false);
  
  const isVisible = onToggleVisibility ? showPassword : internalShow;
  const toggleVisibility = onToggleVisibility || (() => setInternalShow(!internalShow));

  return (
    <div className="relative">
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0"
        onClick={toggleVisibility}
        disabled={props.disabled}
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </Button>
    </div>
  );
}
