//requires all other files in this directory
const fs = require("fs");
const path = require("path");
const Command = require("./Command");

const check = (f) => {
  if (!f.name) throw new Error("No command name");
  if (f.length != 3) throw new Error("Invalid command length");
  if (f.before && (typeof f.before != "object" || typeof f.before.length == 'undefined')) //check if f.before is an array
    throw new Error("Invalid command middleware");
  return true;
};

module.exports = (dir) => {
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
      if (check(command)) {
        const { name, before = [] } = command;
        commands[name] = new Command(name, ...[...before, command]);
      }
    });
  return commands;
};
