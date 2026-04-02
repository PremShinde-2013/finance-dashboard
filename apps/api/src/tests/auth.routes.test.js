const request = require('supertest');

jest.mock('../middleware/auth.middleware', () => {
  return (req, _res, next) => {
    req.user = { id: 'user-1', role: 'viewer' };
    next();
  };
});

jest.mock('../modules/auth/auth.service', () => ({
  register: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn(),
  updateMe: jest.fn(),
  changePassword: jest.fn(),
  refreshAccessToken: jest.fn(),
  logout: jest.fn(() => ({ success: true })),
}));

const authService = require('../modules/auth/auth.service');
const app = require('../app');

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 for wrong email format on register', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'wrong-email-format',
      password: 'ValidPass123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('returns 400 for wrong email format on login', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'wrong-email-format',
      password: 'ValidPass123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('returns 409 for duplicate email registration', async () => {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    authService.register.mockRejectedValue(error);

    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'ValidPass123',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Email is already registered');
  });

  it('returns 200 for successful login', async () => {
    authService.login.mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'u1', email: 'test@example.com', role: 'viewer' },
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'ValidPass123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBe('access-token');
  });

  it('returns 200 for logout', async () => {
    const response = await request(app).post('/api/v1/auth/logout').set('authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(authService.logout).toHaveBeenCalled();
  });

  it('returns 400 when refreshToken missing', async () => {
    const response = await request(app).post('/api/v1/auth/refresh').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(authService.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('returns 400 when new password matches current password', async () => {
    const response = await request(app)
      .put('/api/v1/auth/me/password')
      .set('authorization', 'Bearer fake-token')
      .send({
        current_password: 'SamePass123',
        new_password: 'SamePass123',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(authService.changePassword).not.toHaveBeenCalled();
  });

  it('returns 200 for refresh token exchange', async () => {
    authService.refreshAccessToken.mockResolvedValue({ token: 'new-access-token' });

    const response = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: 'refresh-token' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBe('new-access-token');
  });
});
