export function onlyIf(conditionFn, ...args) {
	return (msg, client, params, next) => {
		if (conditionFn(...args)) {
			next();
		}
	};
}
