export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  LOCKED = "locked",
}
export type UserType = {
  id: number;
  authProvider: string | null;
  email: string;
  fullName: string;
  createdAt: Date;

  failedLoginCount: number;
  failedLoginRetryTime: string | null; // assuming it's a date-time or null

  isEmailVerified: boolean;
  isPin: boolean;
  lastFailedLogin: string | null; // assuming it's a date-time or null
  lastLoginAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providerData: any | null;
  providerId: string | null;
  status: UserStatus;
  updatedAt: Date;
};
