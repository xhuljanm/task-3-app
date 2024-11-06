import jwt from 'jsonwebtoken';
import config from '../config/config';

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, config.jwtSecret as string, { expiresIn: config.jwtSecretExpiry });
};