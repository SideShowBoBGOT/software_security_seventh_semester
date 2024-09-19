// express-oauth2-jwt-bearer.d.ts
declare module 'express-oauth2-jwt-bearer' {
    import { RequestHandler } from 'express';
  
    interface AuthOptions {
      audience?: string;
      issuerBaseURL: string;
      tokenSigningAlg?: string;
    }
  
    export function auth(options: AuthOptions): RequestHandler;
  }