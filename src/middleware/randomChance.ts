import { MiddlewareFunction } from "../Bot/MiddlewareManager";

export function randomChance(chance:number):MiddlewareFunction {
    // Function that returns middleware that has random chance of passing
    return (msg, client, params, next) => {
      if (Math.random() <= chance) {
        next();
      }
      console.log(`${chance * 100}% too low!`);
    };
  }