module.exports = class ErrorManager {
    constructor(){
        this.stack=[]
    }

    use(ehHandler) {
        if (typeof ehHandler !== 'function') throw new Error('Error handler must be a function!');
        this.stack.push(ehHandler);
    }

    handle(initialError, msg, client, params) {
        let idx = 0;
        const next = (err) => {
            if (err != null || idx >= this.stack.length) {
                return;
            }
            const nextMiddleware = this.stack[idx++];
            setImmediate(() => {
                nextMiddleware(initialError, msg, client, params, next);
            });
        };    
        next();
    }
}