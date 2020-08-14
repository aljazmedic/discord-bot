const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


export default {
	name: "days", //name of the command

	aliases: ["whichday","weekday"],

	run: (msg, client, params) => {
        //final function
        const d = new Date();
        const numday = d.getDay();
        let message;
        switch(numday){
            case 3:
                message="It's wednesday my dudes"
                break;
            default:
                message=`It's ${days[numday]}`
        }
		msg.channel.send(message);
	},
};
