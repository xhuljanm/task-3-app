export interface User {
    id: string;
	name: string;
    email: string;
    password: string;
	isAdmin: boolean;
	createdAt: string;
	selectedSquares: string;
	totalSquares: number;
}

export interface UsersDB {
    users: User[];
}