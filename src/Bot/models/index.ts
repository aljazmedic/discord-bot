'use strict';
import { Sequelize } from 'sequelize';

import { guildFactory } from "./Guild";
import { soundFactory } from "./Sound";
import { JokeFactory } from "./Joke";
import { JokeTypeFactory } from "./JokeType";
import { JokeReplyFactory } from "./JokeReply";

const NODE_ENV = <string>process.env.NODE_ENV;
const { sql: config } = require('../../../config/config.json')[NODE_ENV] || { sql: {} };

export const sequelize = new Sequelize(
	config.database,
	config.username,
	config.password,
	config,
);

export const GuildDB = guildFactory(sequelize);
export const SoundDB = soundFactory(sequelize);
export const JokeDB = JokeFactory(sequelize);
export const JokeTypeDB = JokeTypeFactory(sequelize);
export const JokeReplyDB = JokeReplyFactory(sequelize);

JokeReplyDB.belongsTo(JokeDB, { foreignKey: 'joke_id' })
JokeDB.hasMany(JokeReplyDB, { foreignKey: 'joke_id',	as:'replies' })
JokeTypeDB.hasMany(JokeDB, { foreignKey: 'jtype_id', })
JokeDB.belongsTo(JokeTypeDB, { foreignKey: 'jtype_id' })
