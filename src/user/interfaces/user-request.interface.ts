import { Request } from 'express';

export interface UserRequest extends Request {
  user: {
    id: number;
    cpf: string;
    email: string;
    role: string;
  };
}
