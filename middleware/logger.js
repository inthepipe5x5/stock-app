import morgan from 'morgan';
// Custom token to log request.params
morgan.token('params', (req) => JSON.stringify(req.params));

// Custom token to log request.context
morgan.token('context', (req) => JSON.stringify(req.context));

// Middleware setup
export const loggerMiddleware = morgan((tokens, req, res) => {
    return [
        `Method: ${tokens.method(req, res)}`,
        `Path: ${tokens.url(req, res)}`,
        `Params: ${tokens.params(req, res)}`,
        `Context: ${tokens.context(req, res)}`,
        `Status: ${tokens.status(req, res)}`,
        `Response Time: ${tokens['response-time'](req, res)} ms`
    ].join(' | ');
});
