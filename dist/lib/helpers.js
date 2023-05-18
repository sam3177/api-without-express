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
