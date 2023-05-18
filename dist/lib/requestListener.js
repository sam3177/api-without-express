import url from 'url';
import { StringDecoder } from 'string_decoder';
import { router } from '../router/index.js';
export const requestListener = (req, res) => {
    var _a, _b;
    const parsedUrl = url.parse(req.url, true);
    //trimmed path
    const trimmedPath = (_a = parsedUrl.pathname) === null || _a === void 0 ? void 0 : _a.replace(/^\/+|\/$/g, '');
    console.log('trimmed path', trimmedPath);
    // get method
    const method = (_b = req.method) === null || _b === void 0 ? void 0 : _b.toLowerCase();
    //query string as object
    const queryObj = parsedUrl.query;
    // console.log('query obj', queryObj);
    //headers as an object
    const headers = req.headers;
    // console.log('headers', headers);
    //get payload if any
    const stringDecoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += stringDecoder.write(data);
    });
    req.on('end', () => {
        buffer += stringDecoder.end();
        const handler = router[trimmedPath] || router.notFound;
        const data = {
            path: trimmedPath,
            query: queryObj,
            headers,
            payload: buffer,
            method,
        };
        handler(data, (statusCode, payload) => {
            const stringifiedResponse = JSON.stringify(payload || {});
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode || 200);
            res.end(stringifiedResponse);
        });
    });
};
