const express = require('express');
const router = express.Router();

let tasks = [];
let nextId = 1;

// GET /api/tasks — list all tasks
router.get('/', (req, res) => {
  res.json(tasks);
});

// GET /api/tasks/:id — get a single task
router.get('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST /api/tasks — create a task
router.post('/', (req, res) => {
  const { title, done = false } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const task = { id: nextId++, title, done };
  tasks.push(task);
  res.status(201).json(task);
});

// PUT /api/tasks/:id — replace a task
router.put('/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  const { title, done } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  tasks[index] = { id: tasks[index].id, title, done: done ?? false };
  res.json(tasks[index]);
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
