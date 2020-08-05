export const data = require('./data');

export default function getName() {
	const names = Object.entries(data).map(
		([, a]) => a[Math.floor(Math.random() * a.length)],
	);
	return names.join('');
}
