export class NotFoundError extends Error {

	name = 'Not Found'
	message = "Cette ressource n'existe pas"

	constructor(message) {
		super()
		if (message) {
			this.message = message
		}
	}

}