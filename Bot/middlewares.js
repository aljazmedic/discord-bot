function getEntityFromText(msg, client, mention) {
    const userMatch = mention.match(/^<@!?(\d+)>$/);
    if (userMatch) return msg.mentions.users.get(userMatch[1]);

    const roleMatch = mention.match(/^<@&(\d+)>$/);
    if (roleMatch) return msg.mentions.roles.get(roleMatch[1]);

    const channelMatch = mention.match(/^<#(\d+)>$/);
    if (channelMatch) return client.channels.cache.get(channelMatch[1]);

    return null;
}

const parseIdsToObjects = (msg, client, params, next) => {
    // Middleware that parses args with cache
    params.entities = {};
    const args = params.args || [];
    args.forEach((arg, idx) => {
        const u = getEntityFromText(msg, client, arg);
        if (u) {
            params.args[idx] = params.entities[idx] = u;
        }
    });
    next();
};

const parseNumbers = (msg, client, params, next) => {
    // Middleware that parses args
    params.args = params.args.map((part, idx) => {
        return isNaN(part) || typeof part == 'object' ? part : parseFloat(part);
    });
    next();
};

const randomChance = (chance) => {
    // Function that returns middleware that has random chance of passing
    return (msg, client, params, next) => {
        if (Math.random() <= chance) {
            next();
        }
        console.log(`${chance * 100}% too low!`);
    };
};
export default { parseIdsToObjects, parseNumbers, randomChance };
