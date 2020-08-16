const all = {};

const meme = {
	mission: '1Mission Failed.0013', //https://www.memesoundboard.com
	tbc: '1To%20Be%20Continued.0038',
	gay: '1Im%20G*y.0072',
	nokia: '1Nokia Ringtone.0546',
	why:'1Why.0065',
	nice:'1Noice.0084'
};

const yt = {
	fart: 'W_FRPoJIrlI',
	pog: 'FZUcpVmEHuk',
	elbow: 'pr_kkWVnHoo',
};

Object.entries(meme).forEach(([k, v]) => {
	if (Object.keys(all).includes(k)) {
		console.error(`${k} already defined as sound!`);
	}
	all[k] = { q: v, src: 'meme' };
});

Object.entries(yt).forEach(([k, v]) => {
	if (Object.keys(all).includes(k)) {
		console.error(`${k} already defined as sound!`);
	}
	all[k] = { q: v, src: 'yt' };
});

export default all;
