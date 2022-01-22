const express = require('express');
const path = require('path');
//import apollo server
const {ApolloServer} = require('apollo-server-express');
//import authMiddleware from utils
const {authMiddleware} = require('./utils/auth');

//import typedefs and resolvers after setup
const {typeDefs} = require('./schemas/typeDefs');
const {resolvers} = require('./schemas/resolvers');

const db = require('./config/connection');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });

  await server.start();

  server.applyMiddleware({app});

  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

startServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
