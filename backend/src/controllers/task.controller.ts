import { Request, Response } from "express";
import {
  createTask as createTaskModel,
  findAllTasks,
  findTaskById,
  updateTask as updateTaskModel,
  deleteTask as deleteTaskModel,
  TaskStatus,
  isHighPriority,
} from "../models/task.model";

/**
 * Create a new task
 * @route POST /api/tasks
 * @returns 201 with created task
 */
export const createTask = (req: Request, res: Response): void => {
  const { title, description, status, dueDate } = req.body;

  const newTask = createTaskModel({
    title,
    description,
    status: status as TaskStatus,
    dueDate,
  });

  res.status(201).json(newTask);
};

/**
 * Get all tasks with optional status filter and priority sorting
 * @route GET /api/tasks?status=pending|in_progress|completed&sortByPriority=true
 * @returns 200 with array of tasks
 */
export const getAllTasks = (req: Request, res: Response): void => {
  const { status, sortByPriority } = req.query;

  // Parse sortByPriority query parameter
  const shouldSortByPriority = sortByPriority === "true";

  // Validate status query parameter if provided
  if (status) {
    const statusStr = status as string;
    if (!Object.values(TaskStatus).includes(statusStr as TaskStatus)) {
      res.status(400).json({
        message: `Invalid status query parameter. Must be one of: ${Object.values(TaskStatus).join(", ")}`,
      });
      return;
    }
    const tasks = findAllTasks(statusStr as TaskStatus, shouldSortByPriority);
    res.status(200).json(tasks);
    return;
  }

  const tasks = findAllTasks(undefined, shouldSortByPriority);
  res.status(200).json(tasks);
};

/**
 * Get a single task by ID
 * @route GET /api/tasks/:id
 * @returns 200 with task or 404 if not found
 */
export const getTaskById = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);

  // Validate ID parameter
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid task ID" });
    return;
  }

  const task = findTaskById(id);
  if (!task) {
    res.status(404).json({ message: `Task with ID ${id} not found` });
    return;
  }

  res.status(200).json(task);
};

/**
 * Update an existing task (partial update)
 * @route PATCH /api/tasks/:id
 * @returns 200 with updated task or 404 if not found
 */
export const updateTask = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);

  // Validate ID parameter
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid task ID" });
    return;
  }

  const { title, description, status, dueDate } = req.body;

  const updatedTask = updateTaskModel(id, {
    title,
    description,
    status: status as TaskStatus | undefined,
    dueDate,
  });

  if (!updatedTask) {
    res.status(404).json({ message: `Task with ID ${id} not found` });
    return;
  }

  res.status(200).json(updatedTask);
};

/**
 * Delete a task by ID
 * @route DELETE /api/tasks/:id
 * @returns 200 with deleted task and success message or 404 if not found
 */
export const deleteTask = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);

  // Validate ID parameter
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid task ID" });
    return;
  }

  const deletedTask = deleteTaskModel(id);
  if (!deletedTask) {
    res.status(404).json({ message: `Task with ID ${id} not found` });
    return;
  }

  res.status(200).json({
    message: "Task deleted successfully",
    task: deletedTask,
  });
};
