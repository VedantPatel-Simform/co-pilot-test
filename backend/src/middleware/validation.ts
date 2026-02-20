import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
  taskIdSchema,
} from "../schemas/task.schema";
import {
  sanitizeTitle,
  sanitizeDescription,
  hasSqlInjectionPattern,
  hasXssPattern,
} from "../utils/sanitization";

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
 * Middleware to validate task creation request using Zod schema
 * Also sanitizes input to prevent XSS and SQL injection
 */
export const validateCreateTask = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Check for malicious patterns before validation
    if (req.body.title && typeof req.body.title === "string") {
      if (hasSqlInjectionPattern(req.body.title)) {
        throw new ValidationError(
          "Title contains potentially malicious patterns",
        );
      }
      if (hasXssPattern(req.body.title)) {
        throw new ValidationError(
          "Title contains potentially malicious scripts",
        );
      }
      // Sanitize title
      req.body.title = sanitizeTitle(req.body.title);
    }

    if (req.body.description && typeof req.body.description === "string") {
      if (hasSqlInjectionPattern(req.body.description)) {
        throw new ValidationError(
          "Description contains potentially malicious patterns",
        );
      }
      if (hasXssPattern(req.body.description)) {
        throw new ValidationError(
          "Description contains potentially malicious scripts",
        );
      }
      // Sanitize description
      req.body.description = sanitizeDescription(req.body.description);
    }

    // Validate with Zod schema
    const validatedData = createTaskSchema.parse(req.body);

    // Replace request body with validated and sanitized data
    req.body = validatedData;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod errors into a user-friendly message
      const firstError = error.issues[0];
      throw new ValidationError(firstError.message);
    }
    throw error;
  }
};

/**
 * Middleware to validate task update request using Zod schema
 * Also sanitizes input to prevent XSS and SQL injection
 */
export const validateUpdateTask = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Check for malicious patterns before validation
    if (req.body.title && typeof req.body.title === "string") {
      if (hasSqlInjectionPattern(req.body.title)) {
        throw new ValidationError(
          "Title contains potentially malicious patterns",
        );
      }
      if (hasXssPattern(req.body.title)) {
        throw new ValidationError(
          "Title contains potentially malicious scripts",
        );
      }
      // Sanitize title
      req.body.title = sanitizeTitle(req.body.title);
    }

    if (req.body.description && typeof req.body.description === "string") {
      if (hasSqlInjectionPattern(req.body.description)) {
        throw new ValidationError(
          "Description contains potentially malicious patterns",
        );
      }
      if (hasXssPattern(req.body.description)) {
        throw new ValidationError(
          "Description contains potentially malicious scripts",
        );
      }
      // Sanitize description
      req.body.description = sanitizeDescription(req.body.description);
    }

    // Validate with Zod schema
    const validatedData = updateTaskSchema.parse(req.body);

    // Replace request body with validated and sanitized data
    req.body = validatedData;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod errors into a user-friendly message
      const firstError = error.issues[0];
      throw new ValidationError(firstError.message);
    }
    throw error;
  }
};

/**
 * Middleware to validate query parameters for GET /api/tasks
 */
export const validateGetTasksQuery = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const validatedQuery = getTasksQuerySchema.parse(req.query);
    req.query = validatedQuery as any;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      throw new ValidationError(firstError.message);
    }
    throw error;
  }
};

/**
 * Middleware to validate task ID parameter
 */
export const validateTaskId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const validatedId = taskIdSchema.parse(req.params.id);
    // Attach parsed ID to request for use in controllers
    (req as any).parsedId = validatedId;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      throw new ValidationError(firstError.message);
    }
    throw error;
  }
};
