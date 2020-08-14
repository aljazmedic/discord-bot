export { only } from './only';
export { randomChance } from './randomChance';
export { parseArgs } from './parseArgs';
export { onlyIf } from './onlyIf';

/* import fs from 'fs';
import path from 'path';

const middleware = [];
fs.readdirSync(__dirname)
	.filter(function (file) {
		return (
			file.indexOf('.') !== 0 &&
			file !== 'index.js' &&
			(file.slice(-3) === '.js' || file.indexOf('command') !== -1)
		);
	})
	.forEach(function (file) {
		const middlewareFn = require(path.resolve(__dirname, file));
		if (typeof middlewareFn == 'function') {
			middleware.push(middlewareFn)
		}
	});

export default middleware; */
