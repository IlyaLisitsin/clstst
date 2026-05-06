import { gql, type TypedDocumentNode } from '@apollo/client';

export interface LoginVariables {
  identifier: string;
  password: string;
}

export interface LoginData {
  login: {
    jwt: string | null;
  };
}

export const LOGIN_MUTATION: TypedDocumentNode<LoginData, LoginVariables> = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
    }
  }
`;
