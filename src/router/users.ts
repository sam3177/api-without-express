import {
	checkIfEntityExists,
	parseJsonToObject,
	lib,
} from '../lib/index.js';
import { RequestMethodsEnum, UserInterface } from '../types.js';
import { errorMessages } from '../errors.js';
import { USERS_JSON } from '../lib/consts.js';

import { router } from './index.js';

export const registerUserRoutes = () => {
	router.registerRoute(RequestMethodsEnum.GET, 'users', (req, res) => {
		lib.read('/', USERS_JSON, (err, data) => {
			if (err) throw new Error(err);
			const users = parseJsonToObject(data).users || [];

			res(200, {
				data: users.map(({ password, ...rest }) => rest),
			});
		});
	});

	router.registerRoute(RequestMethodsEnum.GET, 'users/:id', (req, res) => {
		const { params } = req;

		lib.read('/', USERS_JSON, (err, data) => {
			if (err) throw new Error(err);
			const users = parseJsonToObject(data).users || [];
			const { id } = params;

			const user = users.find((user) => user.id === id);

			if (!user)
				return res(400, {
					Error: errorMessages.userNotFound,
				});
			delete user.password;

			res(200, {
				data: user,
			});
		});
	});

	router.registerRoute(RequestMethodsEnum.PUT, 'users/:id', (req, res) => {
		const { params, body } = req;

		const requestBodyObject = parseJsonToObject(body);
		lib.read('/', USERS_JSON, (err, data) => {
			if (err) throw new Error(err);
			const loadedData = parseJsonToObject(data);

			const userToUpdateIdx = (
				loadedData.users as UserInterface[]
			).findIndex((user) => user.id === params.id);

			if (userToUpdateIdx === -1)
				return res(400, {
					message: errorMessages.userNotFound,
				});

			// if (requestBodyObject.data.password)
			// 	requestBodyObject.data.password = hashPassword(
			// 		requestBodyObject.data.password,
			// 	);

			if (requestBodyObject.password) {
				delete requestBodyObject.password;
			}

			const updatedUser = {
				...loadedData.users[userToUpdateIdx],
				...requestBodyObject,
			};
			loadedData.users[userToUpdateIdx] = { ...updatedUser };

			delete updatedUser.password;

			lib.update('/', USERS_JSON, loadedData, (err) => {
				if (!err)
					res(200, {
						data: updatedUser,
					});
			});
		});
	});

	router.registerRoute(
		RequestMethodsEnum.DELETE,
		'users/:id',
		(req, res) => {
			const { params } = req;

			lib.read('/', USERS_JSON, (err, data) => {
				if (err) throw new Error(err);
				const loadedData = parseJsonToObject(data);

				const userExists = checkIfEntityExists(
					loadedData.users,
					'id',
					params.id,
				);

				if (!userExists)
					return res(400, {
						message: errorMessages.userNotFound,
					});

				loadedData.users = (
					loadedData.users as UserInterface[]
				).filter((user) => user.id !== params.id);

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
