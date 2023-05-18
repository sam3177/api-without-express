import { v4 as uuid } from 'uuid';

import {
	checkIfPasswordsMatch,
	checkIfEntityExists,
	parseJsonToObject,
	createNewAuthToken,
	hashPassword,
	lib,
	createNewResetPasswordToken,
} from '../lib/index.js';
import {
	RESET_PASSWORD_TOKEN_EXPIRES,
	USERS_JSON,
} from '../lib/consts.js';
import { RequestMethodsEnum, UserInterface } from '../types.js';
import { errorMessages } from '../errors.js';

import { router } from './index.js';

export const registerAuthRoutes = () => {
	router.registerRoute(RequestMethodsEnum.POST, 'login', (req, res) => {
		const requestBodyObject = parseJsonToObject(req.body);
		const { email, password } = requestBodyObject;
		if (!password || !email)
			return res(400, {
				message: errorMessages.badRequest,
			});

		lib.read('/', USERS_JSON, (err, data) => {
			if (err) throw new Error(err);
			const loadedData = parseJsonToObject(data);
			const users: UserInterface[] = loadedData.users || [];

			const userIdx = users.findIndex((user) => user.email === email);

			if (userIdx === -1)
				return res(400, {
					message: errorMessages.userNotFound,
				});

			const user = users[userIdx];

			if (
				!checkIfPasswordsMatch(user.password.passwordHash, password)
			)
				return res(400, {
					message: errorMessages.invalidPassword,
				});

			const authToken = createNewAuthToken(user.id, user.email);
			loadedData.users[userIdx].password.authToken = authToken;

			lib.update('/', USERS_JSON, loadedData, (err) => {
				if (!err)
					res(200, {
						data: { authToken },
					});
			});
		});
	});

	router.registerRoute(RequestMethodsEnum.POST, 'signup', (req, res) => {
		const requestBodyObject = parseJsonToObject(req.body);
		const { email, password, firstName, lastName } =
			requestBodyObject;

		if (!firstName || !lastName || !password || !email)
			return res(400, {
				message: errorMessages.badRequest,
			});

		lib.read('/', USERS_JSON, (err, data) => {
			if (err) throw new Error(err);
			const loadedData = parseJsonToObject(data);
			const users: UserInterface[] = loadedData.users || [];

			const userExists = checkIfEntityExists(users, 'email', email);

			if (userExists)
				return res(400, {
					message: errorMessages.userAlreadyExists,
				});

			const newUser = {
				id: uuid(),
				firstName,
				lastName,
				email,
			};

			loadedData.users.push({
				...newUser,
				password: { passwordHash: hashPassword(password) },
			});

			lib.update('/', USERS_JSON, loadedData, (err) => {
				if (!err)
					res(200, {
						data: newUser,
					});
			});
		});
	});

	router.registerRoute(
		RequestMethodsEnum.POST,
		'forgot-password',
		(req, res) => {
			const requestBodyObject = parseJsonToObject(req.body);
			const { email } = requestBodyObject;

			if (!email)
				return res(400, {
					message: errorMessages.badRequest,
				});

			lib.read('/', USERS_JSON, (err, data) => {
				if (err) throw new Error(err);
				const loadedData = parseJsonToObject(data);
				const users: UserInterface[] = loadedData.users || [];

				const userIdx = users.findIndex(
					(user) => user.email === email,
				);

				if (userIdx === -1)
					return res(400, {
						message: errorMessages.userNotFound,
					});

				const user = users[userIdx];

				const resetPasswordToken = createNewResetPasswordToken();

				user.password.resetPasswordToken = resetPasswordToken;
				user.password.resetPasswordTokenExpires =
					Date.now() + RESET_PASSWORD_TOKEN_EXPIRES;

				loadedData.users[userIdx] = user;
				lib.update('/', USERS_JSON, loadedData, (err) => {
					if (!err)
						res(200, {
							data: { resetPasswordToken },
						});
				});
			});
		},
	);

	router.registerRoute(
		RequestMethodsEnum.POST,
		'reset-password/:token',
		(req, res) => {
			const requestBodyObject = parseJsonToObject(req.body);
			const { password } = requestBodyObject;
			const { token } = req.params;

			if (!password)
				return res(400, {
					message: errorMessages.badRequest,
				});

			lib.read('/', USERS_JSON, (err, data) => {
				if (err) throw new Error(err);
				const loadedData = parseJsonToObject(data);
				const users: UserInterface[] = loadedData.users || [];

				const userIdx = users.findIndex(
					(user) => user.password.resetPasswordToken === token,
				);

				if (userIdx === -1)
					return res(400, {
						message: errorMessages.userNotFound,
					});

				const user = users[userIdx];

				if (
					!user.password.resetPasswordTokenExpires ||
					user.password.resetPasswordTokenExpires < Date.now()
				) {
					return res(400, {
						message: errorMessages.tokenExpired,
					});
				}

				user.password.resetPasswordTokenExpires = undefined;
				user.password.resetPasswordToken = undefined;
				user.password.authToken = undefined;
				user.password.passwordHash = hashPassword(password);

				loadedData.users[userIdx] = user;
				lib.update('/', USERS_JSON, loadedData, (err) => {
					if (!err)
						res(200, {
							data: { success: true },
						});
				});
			});
		},
	);
};
