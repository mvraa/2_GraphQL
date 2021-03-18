import { graphql } from 'graphql';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';

import * as config from './config';

require('../models/db');

const { graphqlHTTP } = require('express-graphql')

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require('graphql')

async function main() {
  const server = express();
  server.use(cors());
  server.use(morgan('dev'));
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());
  server.use('/:fav.ico', (req, res) => res.sendStatus(204));

  const _game = [
    { id: 1, name: 'Wii Sports', platform: 'Wii', year: '2006', genre: 'Sports', publisherFK: 1 },
    { id: 2, name: 'Super Mario Bros.', platform: 'NES', year: '1985', genre: 'Platform', publisherFK: 1 },
    { id: 3, name: 'Mario Kart Wii', platform: 'Wii', year: '2008', genre: 'Racing', publisherFK: 1 },
    { id: 4, name: 'Grand Theft Auto V', platform: 'PS3', year: '2013', genre: 'Action', publisherFK: 2 },
    { id: 5, name: 'Grand Theft Auto: San Andreas', platform: 'PS2', year: '2004', genre: 'Action', publisherFK: 2 },
    { id: 6, name: 'Grand Theft Auto: Vice City', platform: 'PS2', year: '2002', genre: 'Action', publisherFK: 2 },
    { id: 7, name: 'Gran Turismo 3: A-Spec', platform: 'PS2', year: '2001', genre: 'Racing', publisherFK: 3 },
    { id: 8, name: 'Gran Turismo 4', platform: 'PS2', year: '2004', genre: 'Racing', publisherFK: 3 },
    { id: 9, name: 'Call of Duty: Modern Warfare 3', platform: 'X360', year: '2011', genre: 'Shooter', publisherFK: 4 },
    { id: 10, name: 'Call of Duty: Black Ops', platform: 'X360', year: '2010', genre: 'Shooter', publisherFK: 4 },
    { id: 11, name: 'Call of Duty: Black Ops 3', platform: 'PS4', year: '2015', genre: 'Shooter', publisherFK: 4 }
  ]
  
  const _publisher = [
    { id: 1, name: 'Nintendo', netWorth: 12914000},
    { id: 2, name: 'Take-Two Interactive', netWorth: 404459000 },
    { id: 3, name: 'Sony Computer Entertainment', netWorth: 500000000 },
    { id: 4, name: 'Activision', netWorth: 1502000000 }
  ]

  const GameType = new GraphQLObjectType({
    name: "Game",
    description: "Type resserved for a video game.",
    fields: () => ({
      id: {type: GraphQLNonNull(GraphQLInt)},
      name:{type: GraphQLNonNull(GraphQLString)},
      platform:{type: GraphQLNonNull(GraphQLString)},
      year:{type: GraphQLNonNull(GraphQLString)},
      genre:{type: GraphQLNonNull(GraphQLString)},
      publisherFK: {type: GraphQLNonNull(GraphQLInt)},
      publisher:{
        type: PublisherType,
        resolve: (game) =>{
            return _publisher.find(pub => pub.id === game.publisherFK)
        }
      }
    })
  })

  const PublisherType = new GraphQLObjectType({
    name: "Publisher",
    description: "Type reserved for publishers of games.",
    fields: () => ({
      id: {
        type: GraphQLNonNull(GraphQLInt)
      },
      name:{
        type: GraphQLNonNull(GraphQLString)
      },
      netWorth:{
        type: GraphQLNonNull(GraphQLInt)
      },
      games:{
        type: GraphQLList(GameType),
        resolve: (publisher) =>{
            return _game.filter(game => game.publisherFK === publisher.id)
        }
      }
    })
  })

  const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
      game: {
        type: GameType,
        description: "Get single game",
        args:{
            id: {type: GraphQLInt}
        },
        resolve: (parent, args) => _game.find(game => game.id === args.id)
      },
      publisher: {
        type: PublisherType,
        description: "Get single publisher",
        args:{
            id: {type: GraphQLInt}
        },
        resolve: (parent, args) => _publisher.find(pub => pub.id === args.id)
      },
      games: {
        type: new GraphQLList(GameType),
        description: "List of games",
        resolve: () => _game
      },
      publishers: {
        type: new GraphQLList(PublisherType),
        description: "List of publishers",
        resolve: () => _publisher
      }
    })
  })

  const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutations",
    fields: () => ({
      addGame: {
        type: GameType,
        description: "Add a single game",
        args:{
          name: {type: GraphQLNonNull(GraphQLString)},
          platform: {type: GraphQLString},
          year: {type: GraphQLString},
          genre: {type: GraphQLString},
          publisherFK: {type: GraphQLNonNull(GraphQLInt)}
        },
        resolve: (parent, args) => {
          const game = {
            id: _game.length+1,
            name: args.name,
            platform: args.platform,
            year: args.year,
            genre: args.genre,
            publisherFK: args.publisherFK
          }
          _game.push(game)
          return game
        }
      },
      addPublisher: {
        type: PublisherType,
        description: "Add a single publisher",
        args:{
          name: {type: GraphQLNonNull(GraphQLString)},
          netWorth: {type: GraphQLInt}
        },
        resolve: (parent, args) => {
          const publisher = {
            id: _publisher.length+1,
            name: args.name,
            netWorth: args.netWorth
          }
          _publisher.push(publisher)
          return publisher
        }
      }
    })
  })

  const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
  })
  
  server.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
  }))
  
  server.use('/', (req, res) => {
    res.send('Welcome to GamesApp. Goto /graphQL');
  });

  server.listen(config.port, () => {
    console.log(`Server URL: http://localhost:${config.port}/`);
  });
}

main();