export interface AuthUser {
    id: number;
    email: string;
    name: string;
    second_name?: string | null;
    isVerified: boolean;
    role: string;
}
