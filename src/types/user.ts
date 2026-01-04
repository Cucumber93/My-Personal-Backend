export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  passwordHash?: string;
}


