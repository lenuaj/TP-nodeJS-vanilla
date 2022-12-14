import http from 'node:http'
import { createReadStream } from 'node:fs'
import { userController } from './user/user.controller.js';
import { accessLog } from './utils/loggers/access-log.js';
import * as init from './init.js'

const server = http.createServer(async (request, response) => {

	const url = new URL(request.url, `http://${request.headers.host}`)
	const { method } = request
	const { pathname } = url
	const pathElements = pathname.split('/').filter(e => e != '')

	accessLog(request)

	if (method == 'GET' && (!pathElements[0] || pathElements[0] == 'index.html')) {
		const sendFile = createReadStream('views/index.html')
		sendFile.pipe(response)
	} else if (pathElements[0] == 'user') {
		return await userController(request, response)
	} else {
		response.writeHead(404)
		response.end()
	}



});

init.initFiles()

server.listen(3000, () => console.log('server listen port 3000'));