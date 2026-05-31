import { Role } from '../enums/user-role.enum';

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
}

export interface UserRequestDTO {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: Role;
}
