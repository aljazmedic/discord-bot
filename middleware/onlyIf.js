export function onlyIf(conditionFn) {
	return (msg, client, params, next) => {
		if (conditionFn()) {
			next();
		}
	};
}
