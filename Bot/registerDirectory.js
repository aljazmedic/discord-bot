//requires all other files in this directory
import fs from 'fs';
import path from 'path';
import Command from './Command';
import createMiddleware from './createMiddleware';

const check = (f, fileName) => {
	if (!f.name) throw new Error(`No command name in ${fileName}`);
	if (!f.run) throw new Error(`No command run in ${fileName}`);
	if (f.run.length != 3) throw new Error(`Invalid command length ${f.name}`);
	if (f.before && !Array.isArray(f.before))
		throw new Error(`Invalid command middleware (${f.name})`);
	return true;
};

const tryCheck = (command, { skipErrors, fileName }) => {
	try {
		return check(command, fileName);
	} catch (e) {
		if (!skipErrors) {
			throw e;
		}
	}
	return false;
};

function createCommand(commandSchema, prependMiddlewares) {
	var {
		name: inputName,
		aliases = [],
		check = {},
		before = [],
		run,
		description = '',
	} = commandSchema;
	let name;
	if (Array.isArray(inputName)) {
		name = inputName.shift();
		aliases = inputName.concat(aliases);
	} else {
		name = inputName;
	}
	const c = new Command(
		[name, ...aliases],
		...[...prependMiddlewares, ...before, createMiddleware(check), run],
	); //before is user specified, check is constrains
	c.setDescription(description);
	return c;
}

export default (dir, options = { skipErrors: false }, prependMiddlewares) => {
	const commands = [];
	fs.readdirSync(dir)
		.filter(function (file) {
			return (
				file.indexOf('.') !== 0 &&
				file !== 'index.js' &&
				(file.slice(-3) === '.js' || file.indexOf('command') !== -1)
			);
		})
		.forEach(function (file) {
			const commandSchema = require(path.resolve(
				process.cwd(),
				dir,
				file,
			));
			if (
				tryCheck(commandSchema.default, { ...options, fileName: file })
			) {
				const command = createCommand(
					commandSchema.default,
					prependMiddlewares,
				);
				commands[command.name] = command;
			}
		});
	return commands;
};
