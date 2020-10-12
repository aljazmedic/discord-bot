'use strict';
//requires all other files in this directory
import { readdirSync } from 'fs';
import path from 'path';
import Sequelize, { DataTypes } from 'sequelize';

const {NODE_ENV} = process.env;
const {sql:config} = require('../../config/config.json')[NODE_ENV] || {sql:{}};

var sequelize = new Sequelize(
	config.database,
	config.username,
	config.password,
	config,
);
/* global db:false */
var db = {};

readdirSync(__dirname)
	.filter(function (file) {
		return (
			file.indexOf(`.`) !== 0 &&
			file !== `index.js` &&
			file.slice(-3) === `.js`
		);
	})
	.forEach(function (file) {
		const modelFn = require(path.join(__dirname, file)).default;
		const model = modelFn(sequelize, DataTypes);
		db[model.name] = model;
	});

Object.keys(db).forEach(function (modelName) {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
global.db = db;
