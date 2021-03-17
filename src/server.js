import { graphql } from 'graphql';
import { graphqlHTTP } from 'express-graphql';
import { schema, rootValue } from './schema/';

// The code below starts a bare-bone express web server
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';

import * as config from './config';

async function main() {
  const server = express();
  server.use(cors());
  server.use(morgan('dev'));
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());
  server.use('/:fav.ico', (req, res) => res.sendStatus(204));

  server.use(
    '/graphql',
    graphqlHTTP({
      schema,
      rootValue,
      graphiql: true,
    })
  );
  
  server.use('/', (req, res) => {
    res.send('Hello from demo 5b');
  });

  server.listen(config.port, () => {
    console.log(`Server URL: http://localhost:${config.port}/`);
  });
}

main();