import { NotFoundError } from './not-found-error.js'
import { ConflictError } from './conflict-error.js'
import { errorLog } from '../loggers/error-log.js'

export const errorHandler = (request, response, err) => {
	switch (err.constructor) {
		case NotFoundError:
			response.writeHead(404)
			break

		case ConflictError:
			response.writeHead(409)
			break

		case Error:
			response.writeHead(500)
			break
	}
	errorLog(request, response, err)
	const payload = JSON.stringify(err.message)
	return response.end(payload)
}