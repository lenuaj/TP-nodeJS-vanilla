import fsp from 'node:fs/promises'

export const accessLog = async (request) => {
	const now = new Date()
	const log = `${now.toLocaleString()} - ${request.method} : http://${request.headers.host}${request.url} \n`
	const logFile = await fsp.open('data/logs.txt' , 'a')
	logFile.write(log)
	logFile.close()
}