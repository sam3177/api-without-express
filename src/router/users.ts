import { v4 as uuid } from 'uuid';

import {
	checkIfEntityExists,
	parseJsonToObject,
	hashPassword,
	lib,
} from '../lib/index.js';
import { errorMessages } from '../errors.js';
import { USERS_JSON } from '../lib/consts.js';

export const usersRouter = (data, callback) => {
	const { payload, path, query, method, headers } = data;

	const methodsHandlers: { [key: string]: () => void } = {
		get: () => {
			lib.read('/', USERS_JSON, (err, data) => {
				if (err) throw new Error(err);
				const users = parseJsonToObject(data).users || [];

				const { id } = query;

				if (!id)
					return callback(202, {
						data: users.map(({ password, ...rest }) => rest),
					});

				const user = users.find((user) => user.id === id);

				if (!user)
					return callback(404, {
						message: errorMessages.userNotFound,
					});
				delete user.password;

				callback(202, {
					data: [user],
				});
			});
		},

		post: () => {
			const payloadObject = parseJsonToObject(payload);
			if (
				!payloadObject ||
				!payloadObject.firstName ||
				!payloadObject.lastName ||
				!payloadObject.password ||
				!payloadObject.email ||
				!payloadObject.termsAgreed
			)
				return callback(400, {
					message: errorMessages.badRequest,
				});

			lib.read('/', USERS_JSON, (err, data) => {
				if (err) throw new Error(err);
				const loadedData = parseJsonToObject(data);

				const userExists = checkIfEntityExists(
					loadedData.users,
					'email',
					payloadObject.email,
				);

				if (userExists)
					return callback(400, {
						message: errorMessages.userAlreadyExists,
					});

				const newUser = {
					...payloadObject,
					password: hashPassword(payloadObject.password),
					id:uuid(),
				};

				loadedData.users.push(newUser);

				lib.update('/', USERS_JSON, loadedData, (err) => {
					if (!err)
						callback(202, {
							data: newUser,
						});
				});
			});
		},

		put: () => {
			const payloadObject = parseJsonToObject(payload);
			if (!payloadObject.id)
				return callback(400, {
					message: errorMessages.badRequest,
				});

			lib.read('/', USERS_JSON, (err, data) => {
				if (err) throw new Error(err);
				const loadedData = parseJsonToObject(data);

				const userToUpdateIdx = loadedData.users.findIndex(
					(user) => user.id === payloadObject.id,
				);

				if (userToUpdateIdx === -1)
					return callback(404, {
						message: errorMessages.userNotFound,
					});

				if (payloadObject.data.password)
					payloadObject.data.password = hashPassword(
						payloadObject.data.password,
					);

				const updatedUser = {
					...loadedData.users[userToUpdateIdx],
					...payloadObject.data,
				};
				loadedData.users[userToUpdateIdx] = { ...updatedUser };

				delete updatedUser.password;

				lib.update('/', USERS_JSON, loadedData, (err) => {
					if (!err)
						callback(202, {
							data: updatedUser,
						});
				});
			});
		},

		delete: () => {
			const payloadObject = parseJsonToObject(payload);
			if (!payloadObject.id)
				return callback(400, {
					message: errorMessages.badRequest,
				});

			lib.read('/', USERS_JSON, (err, data) => {
				if (err) throw new Error(err);
				const loadedData = parseJsonToObject(data);

				const userExists = checkIfEntityExists(
					loadedData.users,
					'id',
					payloadObject.id,
				);

				if (!userExists)
					return callback(400, {
						message: errorMessages.userNotFound,
					});

				loadedData.users = loadedData.users.filter(
					(user) => user.id !== payloadObject.id,
				);

				lib.update('/', USERS_JSON, loadedData, (err) => {
					if (!err)
						callback(202, {
							data: true,
						});
				});
			});
		},
	};

	const methodHandler =
		methodsHandlers[method as string] || methodsHandlers.get;

	methodHandler();
};
