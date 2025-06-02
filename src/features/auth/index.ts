// Export auth model
export { useAuth, useAuthActions, AuthProvider } from './model/use-auth';

// Export auth actions
export { 
  loginAction, 
  registerAction, 
  resetPasswordAction, 
  logoutAction,
  login,
  register
} from './api/auth-actions';

// Export auth UI components
export { AuthGuard, UserReservationsGuard } from './ui/AuthGuard';
export { AuthModal } from './components'; // NEW: Export AuthModal

// Export auth types from entities
export type { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData, 
  ResetPasswordData,
  AuthState,
  UserRole
} from '@/entities/user/model/types';

export { 
  canViewUserReservations, 
  isAdmin, 
  getUserFullName,
  getUserRoleName
} from '@/entities/user/model/types';
