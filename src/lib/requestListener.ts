import http from 'http';
import url from 'url';

import { RequestMethodsEnum } from '../types.js';
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
	const trimmedPath =
		parsedUrl.pathname?.replace(/^\/+|\/$/g, '') || '';
	console.log('trimmed path', trimmedPath);

	// get method
	const method = (req.method?.toLowerCase() ||
		'get') as RequestMethodsEnum;

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

		const { handler, params } = router.getHandlerAndParams(
			trimmedPath,
			method,
		);

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
