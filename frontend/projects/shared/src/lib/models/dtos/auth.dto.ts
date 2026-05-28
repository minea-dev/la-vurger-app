export interface AuthRequestDTO {
  email: string;
  password?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: string;
}

export interface AuthResponseDTO {
  token: string;
  email: string;
  role: string;
  name: string;
}
