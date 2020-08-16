const all = {};

const meme = {
	mission: '1Mission Failed.0013', //https://www.memesoundboard.com
	tbc: '1To%20Be%20Continued.0038',
	gay: '1Im%20G*y.0072',
	nokia: '1Nokia Ringtone.0546',
	why:'1Why.0065',
	nice:'1Noice.0084',
	wasted:'1GTA V Wasted.0224',
	random:'1Fortnite Default Dance (Ear Rape).0464',
	enemy:'1Enemy Spotted.0511',
	psy:'1Psy - Gangnam Style.0627',
	corona:'1Its Corona Time.0644',
	call:'1Discord Call.0628',
	notify:'1Discord Notification.0583'

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
