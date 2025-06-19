export enum UserRole {
  ADMIN = 'admin',
  BENEFICIARY = 'beneficiary'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token?: string;
}
