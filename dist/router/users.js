var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { checkIfEntityExists, parseJsonToObject, lib, } from '../lib/index.js';
import { RequestMethodsEnum } from '../types.js';
import { errorMessages } from '../errors.js';
import { USERS_JSON } from '../lib/consts.js';
import { router } from './index.js';
export const registerUserRoutes = () => {
    router.register(RequestMethodsEnum.GET, 'users', (req, res) => {
        lib.read('/', USERS_JSON, (err, data) => {
            if (err)
                throw new Error(err);
            const users = parseJsonToObject(data).users || [];
            res(200, {
                data: users.map((_a) => {
                    var { password } = _a, rest = __rest(_a, ["password"]);
                    return rest;
                }),
            });
        });
    });
    router.register(RequestMethodsEnum.GET, 'users/:id', (req, res) => {
        const { params } = req;
        lib.read('/', USERS_JSON, (err, data) => {
            if (err)
                throw new Error(err);
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
    router.register(RequestMethodsEnum.PUT, 'users/:id', (req, res) => {
        const { params, body } = req;
        const requestBodyObject = parseJsonToObject(body);
        lib.read('/', USERS_JSON, (err, data) => {
            if (err)
                throw new Error(err);
            const loadedData = parseJsonToObject(data);
            const userToUpdateIdx = loadedData.users.findIndex((user) => user.id === params.id);
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
            const updatedUser = Object.assign(Object.assign({}, loadedData.users[userToUpdateIdx]), requestBodyObject);
            loadedData.users[userToUpdateIdx] = Object.assign({}, updatedUser);
            delete updatedUser.password;
            lib.update('/', USERS_JSON, loadedData, (err) => {
                if (!err)
                    res(200, {
                        data: updatedUser,
                    });
            });
        });
    });
    router.register(RequestMethodsEnum.DELETE, 'users/:id', (req, res) => {
        const { params } = req;
        lib.read('/', USERS_JSON, (err, data) => {
            if (err)
                throw new Error(err);
            const loadedData = parseJsonToObject(data);
            const userExists = checkIfEntityExists(loadedData.users, 'id', params.id);
            if (!userExists)
                return res(400, {
                    message: errorMessages.userNotFound,
                });
            loadedData.users = loadedData.users.filter((user) => user.id !== params.id);
            lib.update('/', USERS_JSON, loadedData, (err) => {
                if (!err)
                    res(200, {
                        data: { success: true },
                    });
            });
        });
    });
};
