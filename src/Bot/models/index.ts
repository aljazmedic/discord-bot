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
const logger = getLogger("sequelize")

export const sequelize = new Sequelize(
	config.database,
	config.username,
	config.password,
	{
		logging: (s,) => {
			logger.debug(s)
		},
		...config, set: 2,
		models:
			[TeamPlayerDB, GuildDB, SoundDB, JokeDB, JokeTypeDB, JokeReplyDB, TeamDB, RPSPlayerDB, RPSGame]//'*.model.[tj]s',
	}
);

export { GuildDB, SoundDB, JokeDB, JokeTypeDB, TeamPlayerDB, JokeReplyDB, TeamDB, RPSPlayerDB,RPSGame }

