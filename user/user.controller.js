import { json } from 'stream/consumers'
import fsp from 'node:fs/promises'
import { errorHandler } from '../utils/errors/error-handler.js'
import { NotFoundError } from '../utils/errors/not-found-error.js'
import { errorLog } from '../utils/loggers/error-log.js'

export const userController = async (request, response) => {

	try {
		const url = new URL(request.url, `http://${request.headers.host}`)
		const { method } = request
		const { pathname, searchParams } = url
		const pathElements = pathname.split('/').filter(e => e != '')
	
		let users = []
		let payload
		let data = {}
		const userDataFile = await fsp.readFile('data/users.json', {encoding : 'utf8'})
		if (userDataFile) {
			users = JSON.parse(userDataFile)
		}
	
		switch(method){
	
			case 'GET':

				if (pathElements[1]) {
					const user = users.filter(e => e.id == pathElements[1])
					payload = JSON.stringify(user)
					response.writeHead(200, { 'Content-Type': 'application/json' })
					return response.end(payload)
				}
	
				if (searchParams.get('firstname')) {
					users = users.filter(e => e.firstname.toLowerCase() == searchParams.get('firstname').toLowerCase())
				}
	
				if (searchParams.get('lastname')) {
					users = users.filter(e => e.lastname.toLowerCase() == searchParams.get('lastname').toLowerCase())
				}
	
				payload = JSON.stringify(users)
				response.writeHead(200, { 'Content-Type': 'application/json' })
				break
	
			case 'POST':

				data = await json(request)
				if (users.find(user => user.firstname == data.firstname && user.lastname == data.lastname)) {
					response.writeHead(409)
					response.end("l'utilisateur existe déjà")
				} else {
					try {
						const externalDataResponse = await fetch('https://jsonplaceholder.typicode.com/users')
						const externalData = await externalDataResponse.json()
						const matchData = externalData.find(e => e.email == data.email)
						if (matchData) {
							data = {...matchData, ...data}
						}
					} catch (err) {
						errorLog('https://jsonplaceholder.typicode.com/users ne repond pas')
					}

					users.push(data)
					let outputData = JSON.stringify(users, null, 2)
					await fsp.writeFile('data/users.json', outputData)
					const payloadObject = {
						message: "ajout de l'utilisateur reussi",
						data: data
					}
					payload = JSON.stringify(payloadObject)
					response.write(payload)
					return response.end()

				}
				break

			case 'PUT':

				data = await json(request)
				let userIdx = users.indexOf(users.find(e => e.id == data.id))
				if (userIdx != -1) {
					users.splice(userIdx, 1, data)
					let outputData = JSON.stringify(users, null, 2)
					await fsp.writeFile('data/users.json', outputData)

					const payloadObject = {
						message: "mdofication de l'utilisateur reussi",
						data: data
					}
					payload = JSON.stringify(payloadObject)
					response.writeHead(201)
				} else {
					throw new Error("l'id de l'utilisateur que vous souhaitez modifier n'est pas valide")
				}

			case 'DELETE':

				if (pathElements[1]) {
					if (!users.find(e => e.id == pathElements[1])) {
						throw new NotFoundError("Cet utilisateur n'existe pas")
					}
					users = users.filter(e => e.id != pathElements[1])
					let outputData = JSON.stringify(users, null, 2)
					await fsp.writeFile('data/users.json', outputData)
					response.writeHead(201)
					payload = JSON.stringify({message : `l'utilisateur ${pathElements[1]} est supprimé` })
				} else {
					throw new Error("Requete invalide")
				}
				break
	
			default:
				throw new NotFoundError("Cette action ne sert à rien")
		}
		response.end(payload)
	} catch(err) {
		return errorHandler(request, response, err)
	}
}