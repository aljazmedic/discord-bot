export function only(dict = {}) {
	return (msg, client, params, next) => {
		Object.entries(dict).forEach(([k, v]) => {
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
