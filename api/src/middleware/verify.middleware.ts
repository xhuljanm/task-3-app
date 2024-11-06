import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

// Middleware to verify JWT token
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
	const token = req.headers['authorization']?.split(' ')[1];  // Format: 'Bearer <token>'

    if (!token) {
        res.status(403).json({ isValid: false, message: 'No token provided' });
		return;
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret as string) as { userId: number; };
		res.locals.userId = decoded.userId;
		next();  // Proceed to the next middleware or route handler
    } catch (err) {
		if (err instanceof jwt.TokenExpiredError) res.status(401).json({ isValid:false, message: 'Token has expired' });
		else res.status(401).json({ isValid: false, message: 'Invalid token' });

		return;
    }
};