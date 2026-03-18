// src/context/AuthContext.jsx
import { createContext, useContext } from "react";
import { useQuery, gql } from "@apollo/client";

const AuthContext = createContext();

const GET_ME = gql`
  query Me {
    me {
      id
      username
      firstName
      lastName
      userType
      profileImage
      institution { name }
    }
  }
`;

export function AuthProvider({ children }) {

  const { data, loading } = useQuery(GET_ME, {
    fetchPolicy: "cache-first"
  });

  return (
    <AuthContext.Provider value={{
      user: data?.me,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);