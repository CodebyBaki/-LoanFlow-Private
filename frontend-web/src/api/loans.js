import client from './client';

export const applyForLoan      = (data)   => client.post('/loans', data);
export const getMyLoans        = (params) => client.get('/loans/mine', { params });
export const getLoanById       = (id)     => client.get(`/loans/${id}`);
export const calculateLoan     = (params) => client.get('/loans/calculate', { params });
export const getAllLoans        = (params) => client.get('/loans', { params });
export const reviewLoan        = (id, data) => client.patch(`/loans/${id}/review`, data);
