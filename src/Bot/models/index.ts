import { Model, Sequelize, SequelizeOptions, ModelCtor } from 'sequelize-typescript';

import GuildDB from "./Guild.model";
import SoundDB from "./Sound.model";
import JokeDB from "./Joke.model";
import JokeTypeDB from "./JokeType.model.";
import JokeReplyDB from "./JokeReply.model";
import TeamDB from './Team.model'
import TeamPlayerDB from './TeamPlayer.model'
import RPSPlayerDB from './RPSPlayer.model'
import { sql as config } from '../../config'
import { getLogger } from '../../logger';
import RPSGame from './RPSGame.mode';
import Wisdom from './Wisdom.model';
const logger = getLogger("sequelize")

export const sequelize = new Sequelize(config,
	{
		logging: (s,) => {
			logger.debug(s)
		},
		//...(config.other || {}),
		set: 2,
		models:
			[TeamPlayerDB, GuildDB, SoundDB, /* JokeDB, JokeTypeDB, JokeReplyDB,*/ TeamDB, RPSPlayerDB, RPSGame, Wisdom]//'*.model.[tj]s',
	}
);

export { GuildDB, SoundDB, TeamPlayerDB,/*JokeDB,  JokeTypeDB,  JokeReplyDB,*/ TeamDB, RPSPlayerDB, RPSGame, Wisdom }

