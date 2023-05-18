import { errorMessages } from '../errors.js';
import { registerUserRoutes } from './users.js';
import { registerAuthRoutes } from './auth.js';
const router = {
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
    getHandlerAndParams: (route, method) => {
        const methodRoutes = router.routes[method];
        if (methodRoutes[route])
            return { handler: methodRoutes[route] };
        const routeParts = route.split('/');
        if (routeParts.length === 1)
            return { handler: router.routes.notFound };
        const params = {};
        let handler = router.routes.notFound;
        Object.keys(methodRoutes)
            .filter((key) => key.split('/').length === routeParts.length)
            .map((key) => {
            const keyRouteParts = key.split('/');
            const routePartsMatch = keyRouteParts.every((part, i) => part === routeParts[i] || keyRouteParts[i][0] === ':');
            if (routePartsMatch) {
                handler = methodRoutes[key];
                keyRouteParts.forEach((part, i) => {
                    if (keyRouteParts[i][0] === ':') {
                        params[part.slice(1)] = routeParts[i];
                        return true;
                    }
                });
            }
        });
        return { handler, params };
    },
};
registerUserRoutes();
registerAuthRoutes();
export { router };
