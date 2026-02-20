import { Request, Response, NextFunction } from "express";
import { TaskStatus } from "../models/task.model";

/**
 * Validation error class
 */
class ValidationError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 400;
    this.name = "ValidationError";
  }
}

/**
 * Validate if a string is a valid TaskStatus enum value
 * @param status - Status string to validate
 * @returns true if valid, false otherwise
 */
const isValidTaskStatus = (status: string): status is TaskStatus => {
  return Object.values(TaskStatus).includes(status as TaskStatus);
};

/**
 * Middleware to validate task creation request
 * Validates:
 * - title: required, string, max 200 characters
 * - description: optional, string, max 1000 characters
 * - status: required, valid TaskStatus enum value
 */
export const validateCreateTask = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { title, description, status } = req.body;

  // Validate title
  if (!title) {
    throw new ValidationError("Title is required");
  }
  if (typeof title !== "string") {
    throw new ValidationError("Title must be a string");
  }
  if (title.trim().length === 0) {
    throw new ValidationError("Title cannot be empty");
  }
  if (title.length > 200) {
    throw new ValidationError("Title must not exceed 200 characters");
  }

  // Validate description if provided
  if (description !== undefined) {
    if (typeof description !== "string") {
      throw new ValidationError("Description must be a string");
    }
    if (description.length > 1000) {
      throw new ValidationError("Description must not exceed 1000 characters");
    }
  }

  // Validate status
  if (!status) {
    throw new ValidationError("Status is required");
  }
  if (typeof status !== "string") {
    throw new ValidationError("Status must be a string");
  }
  if (!isValidTaskStatus(status)) {
    throw new ValidationError(
      `Invalid status. Must be one of: ${Object.values(TaskStatus).join(", ")}`,
    );
  }

  next();
};

/**
 * Middleware to validate task update request
 * Validates:
 * - title: optional, string, max 200 characters
 * - description: optional, string, max 1000 characters
 * - status: optional, valid TaskStatus enum value
 * At least one field must be provided for update
 */
export const validateUpdateTask = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { title, description, status } = req.body;

  // Check if at least one field is provided
  if (
    title === undefined &&
    description === undefined &&
    status === undefined
  ) {
    throw new ValidationError(
      "At least one field (title, description, or status) must be provided for update",
    );
  }

  // Validate title if provided
  if (title !== undefined) {
    if (typeof title !== "string") {
      throw new ValidationError("Title must be a string");
    }
    if (title.trim().length === 0) {
      throw new ValidationError("Title cannot be empty");
    }
    if (title.length > 200) {
      throw new ValidationError("Title must not exceed 200 characters");
    }
  }

  // Validate description if provided
  if (description !== undefined) {
    if (typeof description !== "string") {
      throw new ValidationError("Description must be a string");
    }
    if (description.length > 1000) {
      throw new ValidationError("Description must not exceed 1000 characters");
    }
  }

  // Validate status if provided
  if (status !== undefined) {
    if (typeof status !== "string") {
      throw new ValidationError("Status must be a string");
    }
    if (!isValidTaskStatus(status)) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${Object.values(TaskStatus).join(", ")}`,
      );
    }
  }

  next();
};
