const request = require('supertest');

jest.mock('../middleware/auth.middleware', () => {
  return (req, _res, next) => {
    const role = req.headers['x-test-role'] || 'viewer';
    req.user = { id: 'user-1', role };
    next();
  };
});

jest.mock('../modules/transactions/transactions.service', () => ({
  listTransactions: jest.fn(),
  getTransactionById: jest.fn(),
  createTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  softDeleteTransaction: jest.fn(),
  hardDeleteTransaction: jest.fn(),
  restoreTransaction: jest.fn(),
}));

const transactionsService = require('../modules/transactions/transactions.service');
const app = require('../app');

describe('Transactions routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 403 when viewer tries to create transaction', async () => {
    const response = await request(app)
      .post('/api/v1/transactions')
      .set('x-test-role', 'viewer')
      .send({
        amount: 1000,
        type: 'income',
        date: '2026-04-01',
      });

    expect(response.status).toBe(403);
    expect(transactionsService.createTransaction).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid transaction id on get', async () => {
    const response = await request(app)
      .get('/api/v1/transactions/not-a-uuid')
      .set('x-test-role', 'viewer');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(transactionsService.getTransactionById).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid transaction payload', async () => {
    const response = await request(app)
      .post('/api/v1/transactions')
      .set('x-test-role', 'analyst')
      .send({
        amount: -10,
        type: 'income',
        date: '2099-01-01',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(transactionsService.createTransaction).not.toHaveBeenCalled();
  });

  it('passes filters to listTransactions', async () => {
    transactionsService.listTransactions.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });

    const response = await request(app)
      .get('/api/v1/transactions')
      .query({ type: 'expense', search: 'food', limit: 10 })
      .set('x-test-role', 'viewer');

    expect(response.status).toBe(200);
    expect(transactionsService.listTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'expense', search: 'food', limit: '10' }),
      expect.objectContaining({ role: 'viewer' })
    );
  });

  it('returns 201 for analyst valid create transaction', async () => {
    transactionsService.createTransaction.mockResolvedValue({
      id: 'txn-1',
      amount: 1200,
      type: 'income',
      date: '2026-04-01',
    });

    const response = await request(app)
      .post('/api/v1/transactions')
      .set('x-test-role', 'analyst')
      .send({
        amount: 1200,
        type: 'income',
        date: '2026-04-01',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe('txn-1');
  });

  it('returns 200 for viewer listing transactions', async () => {
    transactionsService.listTransactions.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });

    const response = await request(app)
      .get('/api/v1/transactions')
      .set('x-test-role', 'viewer');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('returns 200 for admin hard delete route', async () => {
    transactionsService.hardDeleteTransaction.mockResolvedValue({ id: 'txn-1' });

    const response = await request(app)
      .delete('/api/v1/transactions/550e8400-e29b-41d4-a716-446655440000/hard')
      .set('x-test-role', 'admin');

    expect(response.status).toBe(200);
    expect(transactionsService.hardDeleteTransaction).toHaveBeenCalled();
  });
});
