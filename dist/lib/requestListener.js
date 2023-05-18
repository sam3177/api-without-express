import url from 'url';
import { getHandlerAndParams } from './helpers.js';
import { StringDecoder } from 'string_decoder';
import { router } from '../router/index.js';
export const requestListener = (req, res) => {
    var _a, _b;
    const parsedUrl = url.parse(req.url, true);
    //trimmed path
    const trimmedPath = ((_a = parsedUrl.pathname) === null || _a === void 0 ? void 0 : _a.replace(/^\/+|\/$/g, '')) || '';
    console.log('trimmed path', trimmedPath);
    // get method
    const method = (((_b = req.method) === null || _b === void 0 ? void 0 : _b.toLowerCase()) ||
        'get');
    //query string as object
    const queryObj = parsedUrl.query;
    // console.log('query obj', queryObj);
    //headers as an object
    const headers = req.headers;
    //get body if any
    const stringDecoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += stringDecoder.write(data);
    });
    req.on('end', () => {
        buffer += stringDecoder.end();
        const { handler, params } = getHandlerAndParams(router, trimmedPath, method);
        const reqObject = {
            path: trimmedPath,
            query: queryObj,
            headers,
            body: buffer,
            method,
            params,
        };
        handler(reqObject, (statusCode, payload) => {
            const stringifiedResponse = JSON.stringify(payload || {});
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode || 200);
            res.end(stringifiedResponse);
        });
    });
};
