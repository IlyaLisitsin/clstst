export interface StrapiMessage {
  id: string;
  message: string;
}

export interface StrapiMessageGroup {
  messages: StrapiMessage[];
}

export interface StrapiErrorData {
  statusCode: number;
  error: string;
  message: StrapiMessageGroup[];
  data: StrapiMessageGroup[];
}

export interface StrapiException {
  code: number;
  data: StrapiErrorData;
  stacktrace: string[];
}

export interface StrapiGraphQLExtensions {
  code: string;
  exception: StrapiException;
}
