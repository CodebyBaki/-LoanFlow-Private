import client from './client';

export const getMyScore        = ()       => client.get('/credit/my-score');
