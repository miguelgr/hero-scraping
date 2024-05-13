const Hero = require('@ulixee/hero');
const fastify = require('fastify')({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    }
});

fastify.get('/', async (request, reply) => {
    const queryAsObject = request.query;
    const startTime = Date.now(); // Track start time

    if (queryAsObject.url) {
        const hero = new Hero({
            connectionToCore: {
                host: 'core:1818',
            },
            noChromeSandbox: true,
        });
        let resp;

        try {
            resp = await hero.goto(queryAsObject.url);
            let rawContent = await hero.document.documentElement.outerHTML;
            const endTime = Date.now(); // Track end time
            const processingTime = endTime - startTime; // Calculate processing time
            console.log('Processed in ' + processingTime + 'ms');
            reply.send({
                'headers': resp.request.headers,
                'status': resp.response.statusCode,
                'content': rawContent,
                'processingTime': processingTime, // Include processing time in the response
            });
        }
        catch (e) {
            console.error(e);
            reply.code(500).send(`Error: ${e.message}`);
        }
        finally {
            await hero.close();
        }
    } else {
        reply.code(400).send('Need a "url" URL parameter');
    }
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) throw err;
    fastify.log.info(`Server is listening on ${address}`);
});
