import { usersRouter } from './users.js';
import { authRouter } from './auth.js';
type CallbackType = (
	statusCode: number,
	payload?: { [key: string]: any },
) => void;
type HandlerType = (data: any, callback: CallbackType) => void;

const router: {
	[key: string]: HandlerType;
} = {
	users: usersRouter,
	tokens: authRouter,
	notFound: (_, callback) => {
		callback(404, { data: 'not found' });
	},
	ping: (_, callback) => {
		callback(200);
	},
};

export { router };

