export function onlyIn(dict = {}, { isDev } = { isDev: false }) {
	return (msg, client, params, next) => {
		if (isDev) return next();
		Object.entries(dict).forEach(([k, v]) => {
			if (!msg[k]) return;
			if (msg[k].id !== v) {
				console.log('Only not passing');
				next({
					message: `Attempt to call ${params.trigger.fn.name} with ${k} = ${msg[k].id} (not ${v})`,
				});
			}
		});
		next();
	};
}

export function onlyNot(dict = {}, { isDev } = { isDev: false }) {
	return (msg, client, params, next) => {
		if (isDev) return next();
		Object.entries(dict).forEach(([k, v]) => {
			if (!msg[k]) return;
			if (msg[k].id === v) {
				console.log('Invalid ${k} = ${msg[k].id}');
				next({
					message: `Attempt to call ${params.trigger.fn.name} with ${k} = ${msg[k].id} (Prohibited)`,
				});
			}
		});
		next();
	};
}


export function onlyIf(conditionFn, ...args) {
	return (msg, client, params, next) => {
		if (conditionFn(...args)) {
			next();
		}
	};
}
