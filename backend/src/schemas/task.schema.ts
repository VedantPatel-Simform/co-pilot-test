import { z } from "zod";
import { TaskStatus } from "../models/task.model";

/**
 * Custom Zod refinements for task validation
 */

/**
 * Validate that a date is not in the past
 */
const notInPast = (date: string) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today;
};

/**
 * Validate that a date is not too far in the future (max 1 year)
 */
const notTooFarInFuture = (date: string) => {
  const inputDate = new Date(date);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  return inputDate <= maxDate;
};

/**
 * Validate title doesn't contain only numbers
 */
const notOnlyNumbers = (title: string) => {
  return !/^\d+$/.test(title.trim());
};

/**
 * Validate string doesn't have consecutive special characters
 */
const noConsecutiveSpecialChars = (str: string) => {
  return !/[_\-]{3,}/.test(str);
};

/**
 * Task Status Enum Schema
 */
export const taskStatusSchema = z.nativeEnum(TaskStatus, {
  message: `Status must be one of: ${Object.values(TaskStatus).join(", ")}`,
});

/**
 * Title Schema
 * - Required
 * - String between 3-200 characters
 * - Cannot be only numbers
 * - Cannot have consecutive special characters
 * - Must contain valid characters only
 */
export const titleSchema = z
  .string({ message: "Title is required" })
  .min(3, "Title must be at least 3 characters long")
  .max(200, "Title must not exceed 200 characters")
  .regex(
    /^[a-zA-Z0-9\s\-_,.!?()]+$/,
    "Title contains invalid characters. Only letters, numbers, spaces, and basic punctuation are allowed",
  )
  .refine(notOnlyNumbers, {
    message: "Title cannot contain only numbers",
  })
  .refine(noConsecutiveSpecialChars, {
    message: "Title cannot have consecutive special characters (---, ___)",
  })
  .transform((val) => val.trim());

/**
 * Description Schema
 * - Optional
 * - String up to 1000 characters
 * - If provided, must be at least 10 characters
 */
export const descriptionSchema = z
  .string({ message: "Description must be a string" })
  .max(1000, "Description cannot exceed 1000 characters")
  .transform((val) => val.trim())
  .optional()
  .or(z.literal("").transform(() => undefined)); // Allow empty string as optional

/**
 * Due Date Schema
 * - Optional
 * - Must be valid ISO 8601 date string
 * - Cannot be in the past
 * - Cannot be more than 1 year in the future
 */
export const dueDateSchema = z
  .string({ message: "Due date must be a valid ISO 8601 date string" })
  .refine(notInPast, {
    message: "Due date cannot be in the past",
  })
  .refine(notTooFarInFuture, {
    message: "Due date cannot be more than 1 year in the future",
  })
  .optional();

/**
 * Create Task Schema
 * Validates the request body for creating a new task
 */
export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  status: taskStatusSchema,
  dueDate: dueDateSchema,
});

/**
 * Update Task Schema
 * Validates the request body for updating an existing task
 * All fields are optional, but at least one must be provided
 */
export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.or(z.null()), // Allow null to clear description
    status: taskStatusSchema.optional(),
    dueDate: dueDateSchema.or(z.null()), // Allow null to clear due date
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return (
        data.title !== undefined ||
        data.description !== undefined ||
        data.status !== undefined ||
        data.dueDate !== undefined
      );
    },
    {
      message:
        "At least one field (title, description, status, or dueDate) must be provided for update",
    },
  );

/**
 * Query Parameters Schema for GET /api/tasks
 */
export const getTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  sortByPriority: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((val) => val === "true"),
  page: z
    .string()
    .regex(/^\d+$/, "page must be a positive number")
    .transform(Number)
    .refine((n) => n >= 1, { message: "page must be at least 1" })
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "limit must be a positive number")
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100, {
      message: "limit must be between 1 and 100",
    })
    .optional(),
});

/**
 * Task ID Parameter Schema
 */
export const taskIdSchema = z
  .string()
  .regex(/^\d+$/, "Task ID must be a valid number")
  .transform(Number)
  .refine((n) => n >= 1, { message: "Task ID must be positive" })
  .refine((n) => n <= Number.MAX_SAFE_INTEGER, {
    message: "Task ID is too large",
  });

/**
 * Type inference from schemas
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;
export type TaskId = z.infer<typeof taskIdSchema>;
