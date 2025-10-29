import 'express';

export interface User {
  id: number;
  email: string;
  password: string;
}

declare module 'express' {
  export interface Request {
    user?: User;
  }
}
