const { ApolloServer, gql, PubSub } = require('apollo-server');

const pubsub = new PubSub();
const POST_ADDED = 'POST_ADDED';
const BOOK_RETURNED = 'BOOK_RETURNED';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type Subscription {
    bookAdded: Book,
    bookReturned: String
  }

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
  title: String
  authors: Author
}

type Author {
  name: String
  books: [Book]
}

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    authors: [Author]

  }

  type Mutation {
  addBook(title: String, name: String): Book
}
`;

const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    authors: {
      name: 'J.K. Rowling',
      books: 'Harry Potter and the Chamber of Secrets'
    }
  },
  {
    title: 'Jurassic Park',
    authors: {
      name: 'Michael Crichton',
      books: 'Harry Potter and the Chamber of Secrets'
    }
  },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Subscription: {
    bookAdded: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([POST_ADDED]),
    },
    bookReturned: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([BOOK_RETURNED]),
    },

  },
  Query: {
    books: () => {
      pubsub.publish(BOOK_RETURNED, {
        'bookReturned': 'retreived books'
      });
      return books;
    },
  },
  Mutation: {
    addBook: (root, { title, name }) => {
      let bookFound = books.find(book => book.title === title)
      if (!bookFound) {
        let a = {
          'title': title,
          'authors': {
            'name': name,
            'books': 'Harry Potter and the Chamber of Secrets'
          }
        }
        pubsub.publish(POST_ADDED, {
          'bookAdded': a
        });
        
        books.push(a)
        return a;
      }
      return bookFound;
    },
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});