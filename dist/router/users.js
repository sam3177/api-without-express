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
import { v4 as uuid } from 'uuid';
import { checkIfEntityExists, parseJsonToObject, hashPassword, lib, } from '../lib/index.js';
import { errorMessages } from '../errors.js';
import { USERS_JSON } from '../lib/consts.js';
export const usersRouter = (data, callback) => {
    const { payload, path, query, method, headers } = data;
    const methodsHandlers = {
        get: () => {
            lib.read('/', USERS_JSON, (err, data) => {
                if (err)
                    throw new Error(err);
                const users = parseJsonToObject(data).users || [];
                const { id } = query;
                if (!id)
                    return callback(202, {
                        data: users.map((_a) => {
                            var { password } = _a, rest = __rest(_a, ["password"]);
                            return rest;
                        }),
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
            if (!payloadObject ||
                !payloadObject.firstName ||
                !payloadObject.lastName ||
                !payloadObject.password ||
                !payloadObject.email ||
                !payloadObject.termsAgreed)
                return callback(400, {
                    message: errorMessages.badRequest,
                });
            lib.read('/', USERS_JSON, (err, data) => {
                if (err)
                    throw new Error(err);
                const loadedData = parseJsonToObject(data);
                const userExists = checkIfEntityExists(loadedData.users, 'email', payloadObject.email);
                if (userExists)
                    return callback(400, {
                        message: errorMessages.userAlreadyExists,
                    });
                const newUser = Object.assign(Object.assign({}, payloadObject), { password: hashPassword(payloadObject.password), id: uuid() });
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
                if (err)
                    throw new Error(err);
                const loadedData = parseJsonToObject(data);
                const userToUpdateIdx = loadedData.users.findIndex((user) => user.id === payloadObject.id);
                if (userToUpdateIdx === -1)
                    return callback(404, {
                        message: errorMessages.userNotFound,
                    });
                if (payloadObject.data.password)
                    payloadObject.data.password = hashPassword(payloadObject.data.password);
                const updatedUser = Object.assign(Object.assign({}, loadedData.users[userToUpdateIdx]), payloadObject.data);
                loadedData.users[userToUpdateIdx] = Object.assign({}, updatedUser);
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
                if (err)
                    throw new Error(err);
                const loadedData = parseJsonToObject(data);
                const userExists = checkIfEntityExists(loadedData.users, 'id', payloadObject.id);
                if (!userExists)
                    return callback(400, {
                        message: errorMessages.userNotFound,
                    });
                loadedData.users = loadedData.users.filter((user) => user.id !== payloadObject.id);
                lib.update('/', USERS_JSON, loadedData, (err) => {
                    if (!err)
                        callback(202, {
                            data: true,
                        });
                });
            });
        },
    };
    const methodHandler = methodsHandlers[method] || methodsHandlers.get;
    methodHandler();
};
