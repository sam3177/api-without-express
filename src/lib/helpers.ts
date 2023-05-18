import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { config } from './config.js';
import {
	RequestMethodsEnum,
	RouteHandlerType,
	RouterInterface,
} from '../types.js';

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

export const createNewAuthToken = (userId: string, email: string) =>
	jwt.sign({ user_id: userId, email }, process.env.TOKEN_KEY as any, {
		expiresIn: '1h',
	});

export const createNewResetPasswordToken = () => {
	const buffer = crypto.randomBytes(32);
	const token = buffer.toString('hex');

	return token;
};

