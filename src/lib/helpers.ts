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

export const getHandlerAndParams: (
	router: RouterInterface,
	route: string,
	method: RequestMethodsEnum,
) => {
	handler: RouteHandlerType;
	params?: { [key: string]: string };
} = (router, route, method) => {
	const methodRoutes = router.routes[method];
	if (methodRoutes[route]) return { handler: methodRoutes[route] };

	const routeParts = route.split('/');
	if (routeParts.length === 1)
		return { handler: router.routes.notFound };

	const params = {};
	let handler: RouteHandlerType = router.routes.notFound;

	Object.keys(methodRoutes)
		.filter((key) => key.split('/').length === routeParts.length)
		.map((key) => {
			const keyRouteParts = key.split('/');
			const routePartsMatch = keyRouteParts.every(
				(part: string, i: number) =>
					part === routeParts[i] || keyRouteParts[i][0] === ':',
			);
			if (routePartsMatch) {
				handler = methodRoutes[key];
				keyRouteParts.forEach((part: string, i: number) => {
					if (keyRouteParts[i][0] === ':') {
						params[part.slice(1)] = routeParts[i];
						return true;
					}
				});
			}
		});

	return { handler, params };
};
