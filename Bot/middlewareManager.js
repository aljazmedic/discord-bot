module.exports = class MiddlewareManager {
    constructor(){
        this.stack=[]
    }

    use(middlewareFunction) {
        if (typeof middlewareFunction !== 'function') throw new Error('Middleware must be a function!');
        this.stack.push(middlewareFunction);
    }

    handle(msg, client, params, callback) {
        let idx = 0;
        const next = (err) => {
            if (err != null) {
                return setImmediate(() => callback(err));
            }
            if (idx >= this.stack.length) {
                return setImmediate(() => callback(msg,client,params));
            }
            const nextMiddleware = this.stack[idx++];
            setImmediate(() => {
                try {
                    nextMiddleware(msg, client, params, next);
                } catch(error) {
                    next(error);
                }
            });
        };    
        next();
    }
}