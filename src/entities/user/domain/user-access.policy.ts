import { User, EUserRole } from '../model/types';

// DDD: Domain service for user access control
export class UserAccessPolicy {
  /**
   * Validates and parses a user ID from string
   * @throws {InvalidUserIdError} When userId is invalid
   */
  static validateUserId(userId: string): number {
    const userIdNumber = parseInt(userId, 10);
    
    if (isNaN(userIdNumber) || userIdNumber <= 0) {
      throw new InvalidUserIdError(`ID de usuario inválido: "${userId}"`);
    }
    
    return userIdNumber;
  }

  /**
   * Determines if a user can access another user's reservations
   * Business rules:
   * - Admin users can access any reservations
   * - Regular users can only access their own reservations
   * - Unauthenticated users cannot access anything
   */
  static canAccessReservations(
    requestingUser: User | null, 
    targetUserId: number
  ): boolean {
    // Unauthenticated users have no access
    if (!requestingUser) {
      return false;
    }
    
    // Admin users can access any reservations
    if (requestingUser.role === EUserRole.ADMIN || requestingUser.role === EUserRole.SUPER_ADMIN) {
      return true;
    }
    
    // Regular users can only access their own reservations
    return requestingUser.id === targetUserId;
  }

  /**
   * Gets the access level for a user
   */
  static getAccessLevel(user: User | null): AccessLevel {
    if (!user) return AccessLevel.NONE;
    if (user.role === EUserRole.ADMIN || user.role === EUserRole.SUPER_ADMIN) return AccessLevel.ADMIN;
    return AccessLevel.USER;
  }
}

// DDD: Domain exceptions
export class InvalidUserIdError extends Error {
  readonly name = 'InvalidUserIdError';
  
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidUserIdError.prototype);
  }
}

export class AccessDeniedError extends Error {
  readonly name = 'AccessDeniedError';
  
  constructor(message: string, public readonly requiredRole?: EUserRole) {
    super(message);
    Object.setPrototypeOf(this, AccessDeniedError.prototype);
  }
}

// DDD: Value objects
export enum AccessLevel {
  NONE = 'none',
  USER = 'user', 
  ADMIN = 'admin'
}
