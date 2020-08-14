export function parseArgs(argparser) {
	return (msg, client, params, next) => {
        params.parsed = argparser.parseArgs()
		next();
	};
}
