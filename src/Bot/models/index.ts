import { Model, Sequelize, SequelizeOptions, ModelCtor } from 'sequelize-typescript';

import GuildDB from "./Guild.model";
import SoundDB from "./Sound.model";
import JokeDB from "./Joke.model";
import JokeTypeDB from "./JokeType.model.";
import JokeReplyDB from "./JokeReply.model";
import TeamDB from './Team.model'
import TeamPlayerDB from './TeamPlayer.model'

const NODE_ENV = <string>process.env.NODE_ENV;
const { sql: config } = require('../../../config/config.json')[NODE_ENV] || { sql: {} };

export const sequelize = new Sequelize(
	config.database,
	config.username,
	config.password,
	{
		...config,
		models:
			[TeamPlayerDB, GuildDB, SoundDB, JokeDB, JokeTypeDB, JokeReplyDB, TeamDB]//'*.model.[tj]s'
	}
);

export { GuildDB, SoundDB, JokeDB, JokeTypeDB, TeamPlayerDB, JokeReplyDB, TeamDB }

