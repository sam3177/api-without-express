import { errorMessages } from '../errors.js';
import { RouterInterface } from '../types.js';

import { registerUserRoutes } from './users.js';
import { registerAuthRoutes } from './auth.js';

const router: RouterInterface = {
	routes: {
		get: {},
		post: {},
		put: {},
		delete: {},
		notFound: (_, callback) => {
			callback(404, { Error: errorMessages.notFound });
		},
		ping: (_, callback) => {
			callback(200);
		},
	},

	register: (method, path, handler) => {
		router.routes[method][path] = handler;
	},
};

registerUserRoutes();
registerAuthRoutes();

export { router };
