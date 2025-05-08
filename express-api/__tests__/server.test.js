const request = require('supertest');
const app = require('../server');

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
