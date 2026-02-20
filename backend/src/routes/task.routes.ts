import { Router } from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../middleware/validation";

const router = Router();

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Public
 */
router.post("/", validateCreateTask, createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (with optional status filter)
 * @query   status - Filter by task status (pending, in_progress, completed)
 * @access  Public
 */
router.get("/", getAllTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Public
 */
router.get("/:id", getTaskById);

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update an existing task (partial update)
 * @access  Public
 */
router.patch("/:id", validateUpdateTask, updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task by ID
 * @access  Public
 */
router.delete("/:id", deleteTask);

export default router;
