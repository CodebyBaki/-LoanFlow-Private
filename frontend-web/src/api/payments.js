import client from './client';

export const makePayment       = (data)     => client.post('/payments', data);
export const getMyPayments     = (params)   => client.get('/payments/mine', { params });
export const getSchedule       = (loanId)   => client.get(`/payments/schedule/${loanId}`);
export const getAllPayments     = (params)   => client.get('/payments', { params });
