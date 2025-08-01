
import { v4 as uuidv4 } from 'uuid';

let todos = [];


export const getTodos = (req, res) => {
  res.json(todos);
};


export const addTodo = (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTodo = {
    id: uuidv4(),
    title,
    completed: false,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
};


export const updateTodo = (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (title !== undefined) todo.title = title;
  if (completed !== undefined) todo.completed = completed;

  res.json(todo);
};


export const deleteTodo = (req, res) => {
  const { id } = req.params;

  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const deleted = todos.splice(index, 1);
  res.json({ message: 'Todo deleted', deleted: deleted[0] });
};
