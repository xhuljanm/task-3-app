export interface User {
    id: string;
	name: string;
    email: string;
    password: string;
	isAdmin: boolean;
	createdAt: string;
}

export interface UsersDB {
    users: User[];
}