const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
type Query {
  hello: String
}
`;

const resolvers = {
  Query: {
    hello(root, args, context) {
      return 'Hello world!'
    },
  },
}
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});