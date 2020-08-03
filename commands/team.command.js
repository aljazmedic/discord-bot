import { parseNumbers } from "../Bot/middlewares";

function shuffle(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

export default {
	name: "team", //name of the command

	before: [parseNumbers], // middleware functions

	aliases: ["teams", "ekipe", "ekipa"],

	check: {
		minNum: 3,

		args: [
			(first) => {
				if (isNaN(first)) {
					return "must be a number";
				}
				if (first < 2) {
					return "must be greater than 1";
				}
			},
		],
	},

	run: (msg, client, params) => {
		//final function

		const n = params.args.shift();
		const shuffled = shuffle(params.args);
		const ret = {};
		shuffled.forEach((e, idx) => {
			const teamNo = `Team no. ${(idx % n) + 1}:`;
			if (!(teamNo in ret)) ret[teamNo] = [];
			ret[teamNo].push(e);
		});
		const retMessage = Object.entries(ret)
			.map(([teamName, team]) => {
				return `${teamName}\n${team.join("\n")}`;
			})
			.join("\n\n");

		msg.channel.send(retMessage);
	},
};
