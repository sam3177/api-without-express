import http from 'http';
import https from 'https';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config()

import { config } from './lib/config.js';
import { requestListener } from './lib/requestListener.js';
import { httpsServerOptions } from './lib/httpsServerOptions.js';

// instantiate http server
const httpServer = http.createServer(requestListener);

//listen http server
httpServer.listen(config.httpPort, () => {
	console.log(
		`listening on port ${config.httpPort} (${config.name})`,
	);
});



// instantiate https server
// const httpsServer = https.createServer(
// 	httpsServerOptions,
// 	requestListener,
// );

// //listen https server
// httpsServer.listen(config.httpsPort, () => {
// 	console.log(
// 		`listening on port ${config.httpsPort} (${config.name})`,
// 	);
// });
