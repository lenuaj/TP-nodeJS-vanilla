export class ConflictError extends Error {

	name = 'Conflict'
	message = "Cette ressource est en conflit"

	constructor(message) {
		super()
		if (message) {
			this.message = message
		}
	}

}