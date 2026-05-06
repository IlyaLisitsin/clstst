import { gql, type TypedDocumentNode } from '@apollo/client';

export interface UserData {
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export const USER_QUERY: TypedDocumentNode<UserData, Record<string, never>> = gql`
  query User {
    user(id: 2) {
      id
      email
      firstName
      lastName
    }
  }
`;
