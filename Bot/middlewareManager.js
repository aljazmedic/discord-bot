module.exports = class MiddlewareManager {
    constructor(){
        this.stack=[]
    }

    use(middlewareFunction, numParams=null) {
        if (typeof middlewareFunction !== 'function') throw new Error('Middleware must be a function!');
        if (numParams && middlewareFunction.length != numParams) throw new Error('Middleware arguments don\'t match!');
        this.stack.push(middlewareFunction);
    }

    handle(msg, client, params, callback) {
        const errCallback = (err, ...othr) => {
            if(err){
                throw err;
            }
            return callback(...othr)
        }

        let idx = 0;
        const next = (err) => {
            if (err != null) {
                return setImmediate(() => errCallback(err));
            }
            if (idx >= this.stack.length) {
                return setImmediate(() => errCallback(null, msg, client, params));
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