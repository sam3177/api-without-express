import http from 'http';
import url from 'url';

import { StringDecoder } from 'string_decoder';
import { router } from '../router/index.js';

export const requestListener:
	| http.RequestListener<
			typeof http.IncomingMessage,
			typeof http.ServerResponse
	  >
	| undefined = (req, res) => {
	const parsedUrl = url.parse(req.url as string, true);

	//trimmed path
	const trimmedPath = parsedUrl.pathname?.replace(/^\/+|\/$/g, '');
	console.log('trimmed path', trimmedPath);

	// get method
	const method = req.method?.toLowerCase();

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

		const handler = router[trimmedPath as string] || router.notFound;

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
