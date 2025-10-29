import 'express';

export interface User {
    id: number;
    email: string;
    role: string;
}

declare module 'express' {
    export interface Request {
        user?: User;
    }
}
