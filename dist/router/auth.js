import { checkIfPasswordsMatch, checkIfEntityExists, parseJsonToObject, createNewToken, hashPassword, lib, } from '../lib/index.js';
import { errorMessages } from '../errors.js';
import { TOKENS_JSON, USERS_JSON } from '../lib/consts.js';
export const authRouter = (data, callback) => {
    const { payload, path, query, method, headers } = data;
    const methodsHandlers = {
        post: () => {
            const payloadObject = parseJsonToObject(payload);
            if (!payloadObject ||
                !payloadObject.password ||
                !payloadObject.email)
                return callback(400, {
                    message: errorMessages.badRequest,
                });
            lib.read('/', USERS_JSON, (err, data) => {
                var _a;
                if (err)
                    throw new Error(err);
                const loadedData = parseJsonToObject(data);
                const user = (_a = loadedData.users) === null || _a === void 0 ? void 0 : _a.find((user) => user.email === payloadObject.email);
                if (!user)
                    return callback(400, {
                        message: errorMessages.userNotFound,
                    });
                if (!checkIfPasswordsMatch(user.password, payloadObject.password))
                    return callback(400, {
                        message: errorMessages.invalidPassword,
                    });
                const newToken = createNewToken(user.id, user.email);
                lib.read('/', TOKENS_JSON, (err, data) => {
                    if (err)
                        throw new Error(err);
                    const loadedData = parseJsonToObject(data);
                    loadedData.tokens.push(newToken);
                    lib.update('/', TOKENS_JSON, loadedData, (err) => {
                        if (!err)
                            callback(202, {
                                data: { token: newToken.value },
                            });
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
            lib.read('/', TOKENS_JSON, (err, data) => {
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
                lib.update('/', TOKENS_JSON, loadedData, (err) => {
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
            lib.read('/', TOKENS_JSON, (err, data) => {
                if (err)
                    throw new Error(err);
                const loadedData = parseJsonToObject(data);
                const userExists = checkIfEntityExists(loadedData.users, 'id', payloadObject.id);
                if (!userExists)
                    return callback(400, {
                        message: errorMessages.userNotFound,
                    });
                loadedData.users = loadedData.users.filter((user) => user.id !== payloadObject.id);
                lib.update('/', TOKENS_JSON, loadedData, (err) => {
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
