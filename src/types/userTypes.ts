export type UserType = {
  authProvider: string | null;
  createdAt: string; // ISO date string
  email: string;
  failedLoginCount: number;
  failedLoginRetryTime: string | null; // assuming it's a date-time or null
  fullName: string;
  id: number;
  isEmailVerified: boolean;
  isPin: boolean;
  lastFailedLogin: string | null; // assuming it's a date-time or null
  lastLoginAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providerData: any | null;
  providerId: string | null;
  status: "active" | "inactive" | string; // extend as needed
  updatedAt: string;
};
