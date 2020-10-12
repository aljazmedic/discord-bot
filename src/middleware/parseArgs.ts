/* eslint-disable no-unused-vars */
import {ArgumentParser} from 'argparse';
/**
 * 
 * @param {ArgumentParser} argparser 
 */

export function parseArgs(argparser) {
	//with argparser parse the args of a command
	return (msg, client, params, next) => {
		try{
			params.parsed = argparser.parseKnownArgs(params.args)[0];
		}catch(e){
			next(e);
		}
		next();
	};
}