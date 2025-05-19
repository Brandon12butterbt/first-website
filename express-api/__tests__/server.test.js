const request = require('supertest');
const app = require('../server');
const nodemailer = require('nodemailer');
const { __mockDeleteUser } = require('@supabase/supabase-js');

let server;

jest.mock('nodemailer');

jest.mock('@supabase/supabase-js', () => {
  const originalModule = jest.requireActual('@supabase/supabase-js');

  const mockDeleteUser = jest.fn();

  return {
    ...originalModule,
    createClient: jest.fn(() => ({
      auth: {
        admin: {
          deleteUser: mockDeleteUser
        }
      }
    })),
    __mockDeleteUser: mockDeleteUser
  };
});

beforeAll(() => {
  server = app.listen(0);
});

afterAll((done) => {
  server.close(done);
});

const createMockFetch = (status, headers, bodyBuffer) => {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (header) => headers[header.toLowerCase()],
    },
    arrayBuffer: async () => bodyBuffer,
    text: async () => 'Error from API',
  });
};

describe('GET /env', () => {
  it('should return environment variables', async () => {
    process.env.SUPABASE_URL = 'test-url';

    const res = await request(app).get('/env');
    expect(res.statusCode).toBe(200);
    expect(res.body.SUPABASE_URL).toBe('test-url');
  });
});

describe('POST /generate-image', () => {
  beforeEach(() => {
    global.fetch = undefined;
  });

  it('should return 400 if prompt is missing', async () => {
    const res = await request(app).post('/generate-image').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing prompt in request body');
  });

  it('should return an image blob if fetch succeeds', async () => {
    const mockBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    global.fetch = createMockFetch(200, { 'content-type': 'image/png' }, mockBuffer);

    const res = await request(app)
      .post('/generate-image')
      .send({ prompt: 'A cat on a rocket' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('image/png');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  it('should return fallback image if fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    const res = await request(app)
      .post('/generate-image')
      .send({ prompt: 'fallback' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('image/gif');
    expect(Buffer.isBuffer(res.body)).toBe(true);
  });

  it('should return 500 if fetch returns non-OK', async () => {
    global.fetch = createMockFetch(500, { 'content-type': 'text/plain' }, Buffer.from('Internal error'));

    const res = await request(app)
      .post('/generate-image')
      .send({ prompt: 'fail test' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to generate image');
  });
});


describe('POST /contact', () => {
  beforeEach(() => {
    nodemailer.createTransport.mockReset();
  });

  it('should send an email with valid data', async () => {
    const mockSendMail = jest.fn().mockResolvedValue({});
    nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

    const contactData = {
      type: 'technical',
      description: 'This is a test issue.',
      email: 'testuser@example.com'
    };

    const response = await request(app)
      .post('/contact')
      .send(contactData)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Email sent successfully'
    });

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'afluxgen.help@gmail.com',
      subject: expect.stringContaining('Contact Request: technical'),
      text: expect.stringContaining(contactData.description)
    }));
  });

  it('should return 400 if fields are missing', async () => {
    const response = await request(app)
      .post('/contact')
      .send({ type: 'technical' })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Missing required fields'
    });
  });

  it('should return 500 if email sending fails', async () => {
    const mockSendMail = jest.fn().mockRejectedValue(new Error('SMTP failure'));
    nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

    const contactData = {
      type: 'bug',
      description: 'Something is broken.',
      email: 'fail@example.com'
    };

    const response = await request(app)
      .post('/contact')
      .send(contactData)
      .expect(500);

    expect(response.body).toEqual({
      error: 'Failed to send email'
    });
  });
});


describe('DELETE /admin/delete-user/:id', () => {
  beforeEach(() => {
    __mockDeleteUser.mockReset();
  });

  it('should delete user and return success', async () => {
    __mockDeleteUser.mockResolvedValue({ data: {}, error: null });

    const userId = 'test-user-id';
    const response = await request(app)
      .delete(`/admin/delete-user/${userId}`)
      .expect(200);

    expect(response.body).toEqual({ success: true });
    expect(__mockDeleteUser).toHaveBeenCalledWith(userId);
  });

  it('should return 400 if Supabase returns an error', async () => {
    __mockDeleteUser.mockResolvedValue({
      data: null,
      error: { message: 'User not found' }
    });

    const userId = 'non-existent-id';
    const response = await request(app)
      .delete(`/admin/delete-user/${userId}`)
      .expect(400);

    expect(response.body).toEqual({ error: 'User not found' });
    expect(__mockDeleteUser).toHaveBeenCalledWith(userId);
  });
});