import { json } from 'stream/consumers'
import fsp from 'node:fs/promises'

export const userController = async (request, response) => {

	const url = new URL(request.url, `http://${request.headers.host}`)
	const { method } = request
	const { pathname, searchParams } = url
	const contentType = request.headers['content-type']
	const pathElements = pathname.split('/').filter(e => e != '')

	let users = []
	const userDataFile = await fsp.readFile('users.json', {encoding : 'utf8'})
	if (userDataFile) {
		users = JSON.parse(userDataFile)
	}

	if (method == 'GET') {

		if (pathElements[1]) {
			const user = users = users.filter(e => e.id == pathElements[1])
			const payload = JSON.stringify(user)
			response.writeHead(200 ,{ 'Content-Type': 'application/json' })
			return response.end(payload)
		}

		if (searchParams.get('firstname')) users = users.filter(e => e.firstname.toLowerCase() == searchParams.get('firstname').toLowerCase())
		const data = JSON.stringify(users)
		response.writeHead(200 ,{ 'Content-Type': 'application/json' })
		return response.end(data)

	}

	if (method == 'POST') {

		if (contentType == 'application/json') {
			const data = await json(request)
			if (users.find(user => user.firstname == data.firstname && user.lastname == data.lastname)) {
				response.writeHead(409)
				response.end("l'utilisateur existe déjà")

			} else {
				users.push(data)
				let outputData = JSON.stringify(users, null, 2)
				await fsp.writeFile('users.json', outputData)
				const payloadObject = {
					message : "ajout de l'utilisateur reussi",
					data: data
				}
				const payload = JSON.stringify(payloadObject)
				response.write(payload)
				response.end()

			}

		}

	}

	if (method == 'PUT') {
		const data = await json(request)

		let users = []
		const userDataFile = await fsp.readFile('users.json', {encoding : 'utf8'})

		if (userDataFile) {
			users = JSON.parse(userDataFile)
		} else {
			response.writeHead(404)
			response.end('aucun utilisateur enregistré')
		}

		let userIdx = users.indexOf(users.find(e => e.id == data.id))

		if (userIdx != -1) {
			users.splice(userIdx, 1 , data)
			let outputData = JSON.stringify(users, null, 2)
			await fsp.writeFile('users.json', outputData)

			const payloadObject = {
				message : "mdofication de l'utilisateur reussi",
				data: data
			}
			const payload = JSON.stringify(payloadObject)
			response.writeHead(201)
			response.end(payload)
		} else {
			response.writeHead(400)
			response.end("l'id de l'utilisateur que vous souhaitez modifier n'est pas valide")
		}
	}

	if (method == 'DELETE' && pathElements[1]) {
		users = users.filter(e => e.id != pathElements[1])
		let outputData = JSON.stringify(users, null, 2)
		await fsp.writeFile('users.json', outputData)
		response.writeHead(201)
		response.end(`l'utilisateur ${pathElements[1]} est supprimé`)
	}
}