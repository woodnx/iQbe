import { findRefreshToken } from '@/models/RefreshTokens';

export const searchRefreshToken = (userId: number) => (
  findRefreshToken(userId)
  .then(tokens => { 
    if (!tokens) return undefined;
    
    return tokens.token;
  })
);