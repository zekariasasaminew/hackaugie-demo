const request = require('supertest');

// Re-require the router fresh before each test so in-memory state resets
let app;
beforeEach(() => {
  jest.resetModules();
  app = require('../index');
});

describe('GET /api/tasks', () => {
  it('returns an empty array when no tasks exist', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all tasks after creation', async () => {
    await request(app).post('/api/tasks').send({ title: 'Task A' });
    await request(app).post('/api/tasks').send({ title: 'Task B' });
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('Task A');
    expect(res.body[1].title).toBe('Task B');
  });
});

describe('GET /api/tasks/:id', () => {
  it('returns the task when it exists', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Find me' });
    const id = created.body.id;

    const res = await request(app).get(`/api/tasks/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id, title: 'Find me', done: false });
  });

  it('returns 404 when task does not exist', async () => {
    const res = await request(app).get('/api/tasks/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });
});

describe('POST /api/tasks', () => {
  it('creates a task with default done=false', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'New task' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'New task', done: false });
    expect(res.body.id).toBeDefined();
  });

  it('creates a task with done=true when specified', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Done task', done: true });
    expect(res.status).toBe(201);
    expect(res.body.done).toBe(true);
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/tasks').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'title is required' });
  });

  it('returns 400 when title is empty string', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'title is required' });
  });

  it('assigns incrementing unique IDs', async () => {
    const first = await request(app).post('/api/tasks').send({ title: 'First' });
    const second = await request(app).post('/api/tasks').send({ title: 'Second' });
    expect(second.body.id).toBeGreaterThan(first.body.id);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('updates the task title and done status', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Old title' });
    const id = created.body.id;

    const res = await request(app).put(`/api/tasks/${id}`).send({ title: 'New title', done: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id, title: 'New title', done: true });
  });

  it('defaults done to false when not provided in update', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Task', done: true });
    const id = created.body.id;

    const res = await request(app).put(`/api/tasks/${id}`).send({ title: 'Task' });
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(false);
  });

  it('returns 404 when task does not exist', async () => {
    const res = await request(app).put('/api/tasks/999').send({ title: 'Ghost' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });

  it('returns 400 when title is missing', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Task' });
    const id = created.body.id;

    const res = await request(app).put(`/api/tasks/${id}`).send({ done: true });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'title is required' });
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes the task and returns 204', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'To delete' });
    const id = created.body.id;

    const res = await request(app).delete(`/api/tasks/${id}`);
    expect(res.status).toBe(204);
  });

  it('task is no longer accessible after deletion', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'To delete' });
    const id = created.body.id;

    await request(app).delete(`/api/tasks/${id}`);
    const res = await request(app).get(`/api/tasks/${id}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 when task does not exist', async () => {
    const res = await request(app).delete('/api/tasks/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });
});
