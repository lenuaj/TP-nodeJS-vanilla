import fs from 'node:fs'

export const initFiles = async () => {
	fs.openSync('data/logs.txt', 'a')
	fs.openSync('data/errors.txt', 'a')
	fs.openSync('data/users.json', 'a')
}