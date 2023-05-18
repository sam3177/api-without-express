import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
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
export const createNewToken = (userId, email) => ({
    id: uuid(),
    value: jwt.sign({ user_id: userId, email }, process.env.TOKEN_KEY, {
        expiresIn: '1h',
    }),
});
