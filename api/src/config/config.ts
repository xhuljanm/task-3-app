import { config as conf } from 'dotenv';
conf();

const config = {
	port:  process.env['PORT'],
	production:  process.env['NODE_ENV'] === 'production',
	jwtSecret: process.env['JWT_SECRET'],
	jwtSecretExpiry: process.env['JWT_SECRET_EXPIRY']
};

export default config;