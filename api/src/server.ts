import express, { Express, Request, Response } from "express";
import config from "./config/config";
import cors from 'cors';
import path from "path";
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

import { generateToken } from "./middleware/generate.middleware";
import { verifyToken } from "./middleware/verify.middleware";

import { readFileSync, writeFileSync } from "fs";
import { User, UsersDB } from './interfaces/user.interface';

const usersDBPath = path.join(__dirname, 'users', 'db.json');
const app: Express = express();

const readUsersFromFile = (): UsersDB => {
    try {
        const data = readFileSync(usersDBPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading users data:', err);
        return { users: [] }; // Return empty array for new users
    }
};

const saveUsersToFile = (users: User[]): void => {
    try {
        const data = JSON.stringify({ users }, null, 2);
        writeFileSync(usersDBPath, data, 'utf8');
    } catch (err) {
        console.error('Error saving users data:', err);
    }
};

const passwordRegex = /(?=.*[A-Z])(?=.*\d).{8,}/;

app.use(express.json());

app.use(cors({
	origin: 'http://localhost:4200',  // Allow requests from your Angular app
	methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
	allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
}));

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API is up to date.' });
});

app.post('/login', (req: Request, res: Response): any => {
	const { email, password, isAdmin } = req.body;

	const requiredFields = [
		{ field: email, name: 'Email' },
		{ field: password, name: 'Password' },
		{ field: isAdmin, name: 'isAdmin' }
	];

	for (let { field, name } of requiredFields) {
		if (field === undefined || field === '') return res.status(400).json({ message: `${name} is required` });
	}

    const { users } = readUsersFromFile();

	const user = users.find((user) => user.email === email);
	if (!user) return res.status(400).json({ message: 'User does not exist' });

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });

	if (isAdmin !== undefined && user.isAdmin !== isAdmin) {
        return res.status(400).json({ // If the user tries to login as an admin but their account is not an admin
            message: isAdmin ? "You are not an admin. Login as a normal user." : "You are not authorized to login as a normal user."
        });
    }

	const token = generateToken(user.id);

    return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        token,
        userId: user.id
    });
});

app.post('/register', (req: Request, res: Response): any => {
    const { name, email, password, isAdmin } = req.body;

	const requiredFields = [
		{ field: name, name: 'Name' },
		{ field: email, name: 'Email' },
		{ field: password, name: 'Password' },
		{ field: isAdmin, name: 'isAdmin' }
	];

	for (let { field, name } of requiredFields) {
		if (field === undefined || field === '') return res.status(400).json({ message: `${name} is required` });
	}

    const { users } = readUsersFromFile();

    const userExists = users.some(user => user.email === email);

    if (userExists) return res.status(400).json({ message: 'Email already in use.' });
	if (!passwordRegex.test(password)) return res.status(400).json({ message: 'Password must contain at least 1 uppercase letter, 1 digit, and be at least 8 characters long' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser: User = {
        id: uuidv4(),
		name,
        email,
        password: hashedPassword,
		isAdmin: isAdmin,
		createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsersToFile(users);

    return res.status(201).json({ status: 'success', message: 'User registered successfully', userId: newUser.id });
});

app.get('/user', verifyToken, (req: Request, res: Response): any => {
    const { users } = readUsersFromFile();

    const userId = res.locals.userId;
    const user = users.find(user => user.id === userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
		isAdmin: user.isAdmin,
		createdAt: format(new Date(user.createdAt), 'MMMM dd, yyyy, HH:mm:ss')
    });
});

app.get('/verify-token', verifyToken, (req: Request, res: Response): any => {
	return res.status(200).json({ isValid: true });
});

app.listen(config.port, () => {
	console.log(`Api server is running on port: ${config.port}`);
});