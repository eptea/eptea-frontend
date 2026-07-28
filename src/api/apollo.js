// src/api/apollo.js
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/client/link/context';

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');

  return {
    headers: {
      ...headers,
      authorization: token ? `JWT ${token}` : "",
    }
  }
});

const uploadLink = createUploadLink({
  uri: "https://api.eptea.com.br/graphql/",
});

export const client = new ApolloClient({
  link: authLink.concat(uploadLink),

  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          me: {
            merge: true
          }
        }
      }
    }
  })
});