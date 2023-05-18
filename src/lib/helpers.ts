import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';

import { TOKEN_EXPIRATION } from './consts.js';
import { config } from './config.js';

export const hashPassword = (password: string) =>
	crypto
		.createHmac('sha256', config.passwordSecret)
		.update(password)
		.digest('hex');

export const parseJsonToObject = (str: string) => {
	try {
		return JSON.parse(str);
	} catch (e) {
		return {};
	}
};

export const checkIfEntityExists = (
	collection: any[],
	key: string,
	value: string,
): boolean => collection.some((entity) => entity[key] === value);

export const checkIfPasswordsMatch = (
	hash: string,
	password: string,
) => hashPassword(password) === hash;

export const createNewToken = (userId: string, email: string) => ({
	id: uuid(),
	value: jwt.sign(
		{ user_id: userId, email },
		process.env.TOKEN_KEY as any,
		{
			expiresIn: '1h',
		},
	),
});
