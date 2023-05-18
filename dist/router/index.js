import { usersRouter } from './users.js';
import { authRouter } from './auth.js';
const router = {
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
