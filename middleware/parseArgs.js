import {ArgumentParser} from 'argparse';
/**
 * 
 * @param {ArgumentParser} argparser 
 */

export function parseArgs(argparser) {
	return (msg, client, params, next) => {
        params.parsed = argparser.parseKnownArgs(params.args)[0];
		next();
	};
}
