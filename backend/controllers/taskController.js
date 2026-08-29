const Task = require('../models/Task');

// @desc   Get all tasks belonging to the logged-in user
// @route  GET /api/tasks
// @access Private
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc   Create a new task for the logged-in user
// @route  POST /api/tasks
// @access Private
const createTask = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error('Please add a task title');
    }

    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc   Update a task's title and/or completed status
// @route  PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this task');
    }

    if (typeof req.body.title === 'string') {
      const trimmedTitle = req.body.title.trim();
      if (!trimmedTitle) {
        res.status(400);
        throw new Error('Task title cannot be empty');
      }
      task.title = trimmedTitle;
    }

    if (typeof req.body.completed === 'boolean') {
      task.completed = req.body.completed;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc   Delete a task
// @route  DELETE /api/tasks/:id
// @access Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this task');
    }

    await task.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
