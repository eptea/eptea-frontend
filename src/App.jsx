// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './api/apollo';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ApolloProvider client={client}>
     <AuthProvider> 
      <Router>
        <AppRoutes />
      </Router>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;