import http from 'http';
import { requestListener } from './lib/requestListener.js';
import { config } from './lib/config.js';
// instantiate http server
const httpServer = http.createServer(requestListener);
//listen http server
httpServer.listen(config.httpPort, () => {
    console.log(`listening on port ${config.httpPort} (${config.name})`);
});
