import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
export const hashPassword = (password) => crypto
    .createHmac('sha256', config.passwordSecret)
    .update(password)
    .digest('hex');
export const parseJsonToObject = (str) => {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        return {};
    }
};
export const checkIfEntityExists = (collection, key, value) => collection.some((entity) => entity[key] === value);
export const checkIfPasswordsMatch = (hash, password) => hashPassword(password) === hash;
export const createNewAuthToken = (userId, email) => jwt.sign({ user_id: userId, email }, process.env.TOKEN_KEY, {
    expiresIn: '1h',
});
export const createNewResetPasswordToken = () => {
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString('hex');
    return token;
};
export const getHandlerAndParams = (router, route, method) => {
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
};
