/* eslint-disable no-unused-vars */
import {ArgumentParser} from 'argparse';
import { MiddlewareFunction } from '../Bot/MiddlewareManager';
/**
 * 
 * @param {ArgumentParser} argparser 
 */

export function parseArgs(argparser:ArgumentParser):MiddlewareFunction {
	//with argparser parse the args of a command
	return (msg, client, params, next) => {
		try{
			params.parsed = argparser.parse_known_args(<string[]>params.args)[0];
		}catch(e){
			next(e);
		}
		next();
	};
}
