import { toast } from "sonner";
import { AuthMode } from "../types/auth-mode.type";
import { IAuthStrategy } from "../interfaces/auth-strategy.interface";
import { IModalController } from "../interfaces/modal-controller.interface";
import { LoginStrategy, RegisterStrategy, ResetPasswordStrategy } from "../utils/auth-strategies";
import { useAuth } from "../hooks/use-auth";

export class AuthModalController {
  private strategies = new Map<AuthMode, IAuthStrategy<any>>();
  
  constructor(
    private authService: ReturnType<typeof useAuth>,
    private modalController: IModalController
  ) {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    this.strategies.set(
      "login",
      new LoginStrategy(this.authService, () => {
        this.modalController.onSuccess();
        this.modalController.onClose();
      })
    );

    this.strategies.set(
      "register", 
      new RegisterStrategy(this.authService, () => {
        // Register exitoso, se manejará en el componente
      })
    );

    this.strategies.set(
      "reset",
      new ResetPasswordStrategy(this.authService, () => {
        // Reset exitoso, se manejará en el componente
      })
    );
  }

  async executeStrategy<TData>(mode: AuthMode, data: TData): Promise<void> {
    const strategy = this.strategies.get(mode);
    if (!strategy) {
      throw new Error(`Strategy for mode '${mode}' not found`);
    }

    try {
      await strategy.execute(data);
      toast.success(strategy.getSuccessMessage());
    } catch (error) {
      toast.error(strategy.getErrorMessage(error));
      throw error;
    }
  }

  // Open/Closed: Agregar nuevas estrategias sin modificar código
  registerStrategy<TData>(mode: AuthMode, strategy: IAuthStrategy<TData>) {
    this.strategies.set(mode, strategy);
  }
}
