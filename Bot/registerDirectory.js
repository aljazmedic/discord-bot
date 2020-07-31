//requires all other files in this directory
const fs = require("fs");
const path = require("path");
const Command = require("./Command");
const createMiddleware = require("./createMiddleware");

const check = (f) => {
  if (!f.name) throw new Error("No command name");
  if (f.length != 3) throw new Error(`Invalid command length ${f.name}`);
  if (f.before && (typeof f.before != "object" || typeof f.before.length == 'undefined')) //check if f.before is an array
    throw new Error(`Invalid command middleware (${f.name})`);
  return true;
};

const tryCheck = (command, {skip})=>{
  try{
    return check(command)
  }catch(e){
    if(!skip){
      throw e;
    }
  }
  return false;
}


module.exports = (dir, options={skip:false}) => {
  const commands = [];
  fs.readdirSync(dir)
    .filter(function (file) {
      return (
        file.indexOf(".") !== 0 &&
        file !== "index.js" &&
        file.slice(-3) === ".js"
      );
    })
    .forEach(function (file) {
      const command = require(path.join(__dirname, "..", dir, file));

      if (tryCheck(command, options)) {
        const { name, before = [], aliases=[], check={} } = command;
        commands[name] = new Command([name,...aliases],
          ...[...before, createMiddleware(check), command]); //before is user specified, check is constrains
      }
    });
  return commands;
};
