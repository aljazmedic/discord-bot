import { voice } from '../../middleware';
import ytdl from 'ytdl-core';

console.log(typeof voice);

const playFiles = {
	'fart':'W_FRPoJIrlI',
	'pog':'FZUcpVmEHuk'
}


export default {
	name: Object.keys(playFiles), //name of the command

	before: [voice()],
	run: (msg, client, params) => {
		//final function
		const { authorIn, channel:voiceChannel } = params.voiceChannelInfo;
		if (!authorIn) {
			msg.reply('you must be in a channel :loud_sound:');
			return;
		}
		const ytUri = `https://www.youtube.com/watch?v=${playFiles[params.trigger.call]}`;
		voiceChannel.join().then((vconnection)=>{
			const dispatcher = vconnection.play(ytdl(ytUri, { quality: 'highestaudio',highWaterMark: 1<<25 }));
			dispatcher.on('speaking',(spk)=>{
				if(!spk){
					vconnection.disconnect();
				}
			})
		})
	},
};
