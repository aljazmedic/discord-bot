//requires all other files in this directory
import fs from 'fs';
import path from 'path';
import Command, { CommandFunction } from './Command';
import createMiddleware, { CreateMiddlewareOptions } from './createMiddleware';
import { MiddlewareFunction } from './MiddlewareManager';

const check = (f:CommandSchema, fileName:string) => {
	if (!f.name) throw new Error(`No command name in ${fileName}`);
	if (!f.run) throw new Error(`No command run in ${fileName}`);
	if (f.run.length != 3) throw new Error(`Invalid command length ${f.name}`);
	if (f.before && !Array.isArray(f.before))
		throw new Error(`Invalid command middleware (${f.name})`);
	return true;
};

const tryCheck = (command:CommandSchema, { skipErrors, fileName }:{skipErrors:boolean, fileName:string}) => {
	try {
		return check(command, fileName);
	} catch (e) {
		if (!skipErrors) {
			throw e;
		}
	}
	return false;
};


function createCommand(commandSchema:CommandSchema, prependMiddlewares:MiddlewareFunction[]) {
	var {
		name: inputName,
		aliases = [],
		check = {},
		before = [],
		run,
		description = '',
	} = commandSchema;
	let name:string;
	if (Array.isArray(inputName)) {
		name = inputName.shift();
		aliases = inputName.concat(aliases);
	} else {
		name = inputName;
	}
	const c = new (class T extends Command{
		constructor(){
			super();
			this.name = name;
			this.aliases = aliases;
			this.setDescription(description)
			this.mm.use(...prependMiddlewares, ...before, createMiddleware(check));
		}
		run = run
	})(); //before is user specified, check is constrains
	return c;
}

export default (dir:fs.PathLike, options = { skipErrors: false }, prependMiddlewares:MiddlewareFunction[]) => {
	const commands:{[index:string]:Command} = {};
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
				<string>dir,
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


export interface CommandSchema{
	name: string,
	aliases: string[],
	check: CreateMiddlewareOptions,
	before: MiddlewareFunction[],
	run:CommandFunction,
	description?:string,
}