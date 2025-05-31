"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { AuthFormFactory } from "@/features/auth/utils/auth-form-factory";
import { AuthModalController } from "@/features/auth/controllers/auth-modal-controller";
import { AuthMode } from "@/features/auth/types/auth-mode.type";
import { IFormHandler } from "@/features/auth/interfaces/form-handler.interface";
import { IFormNavigation } from "@/features/auth/interfaces/form-navigation.interface";
import { IModalController } from "@/features/auth/interfaces/modal-controller.interface";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  
  const authService = useAuth();
  const modalController: IModalController = {
    isOpen,
    onClose,
    onSuccess: onLoginSuccess,
  };

  const controller = useMemo(
    () => new AuthModalController(authService, modalController),
    [authService, modalController]
  );

  const navigation: IFormNavigation = {
    currentMode,
    onModeChange: setCurrentMode,
  };

  const createFormHandler = <TData,>(mode: AuthMode): IFormHandler<TData> => ({
    async onSubmit(data: TData) {
      setIsLoading(true);
      try {
        await controller.executeStrategy(mode, data);
        
        // Post-procesamiento específico por modo
        if (mode === "register" || mode === "reset") {
          setCurrentMode("login");
        }
      } finally {
        setIsLoading(false);
      }
    },
    isLoading,
  });

  const formConfig = AuthFormFactory.createForm(currentMode);
  const FormComponent = formConfig.component;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{formConfig.title}</DialogTitle>
          <DialogDescription>{formConfig.description}</DialogDescription>
        </DialogHeader>
        
        <FormComponent
          {...createFormHandler(currentMode)}
          navigation={navigation}
        />
      </DialogContent>
    </Dialog>
  );
}
