import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

/**
 * Winston Logger Configuration
 * Handles application-level logging with file rotation
 */
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: "task-management-api" },
  transports: [
    // Console transport with color coding
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`;
        }),
      ),
    }),

    // Combined log file (all logs) - rotates monthly
    new DailyRotateFile({
      filename: path.join("logs", "combined-%DATE%.log"),
      datePattern: "YYYY-MM",
      maxFiles: "12m", // Keep 12 months of logs
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // Error log file (errors only) - rotates monthly
    new DailyRotateFile({
      filename: path.join("logs", "error-%DATE%.log"),
      datePattern: "YYYY-MM",
      level: "error",
      maxFiles: "12m",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // Access log file (HTTP requests only) - rotates monthly
    new DailyRotateFile({
      filename: path.join("logs", "access-%DATE%.log"),
      datePattern: "YYYY-MM",
      maxFiles: "12m",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

/**
 * Custom Morgan token for execution time
 */
morgan.token("execution-time", (req: Request, res: Response) => {
  const startTime = req.startTime || Date.now();
  const duration = Date.now() - startTime;
  return `${duration}ms`;
});

/**
 * Custom Morgan token for timestamp
 */
morgan.token("timestamp", () => {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
});

/**
 * Custom Morgan format matching required specification
 * Format: [TIMESTAMP] [METHOD] /endpoint - STATUS - Execution time: Xms
 * Plus IP and User-Agent
 */
const morganFormat = [
  "[:timestamp]",
  "[:method]",
  ":url",
  "-",
  ":status",
  "-",
  "Execution time: :execution-time",
  "- IP: :remote-addr",
  "- UA: :user-agent",
].join(" ");

/**
 * Morgan middleware configuration
 * Logs all HTTP requests to console and access log file
 */
export const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      // Remove trailing newline
      const logMessage = message.trim();

      // Parse the log message to extract status code
      const statusMatch = logMessage.match(/- (\d{3}) -/);
      const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 200;

      // Log to Winston with appropriate level based on status code
      if (statusCode >= 500) {
        logger.error(logMessage);
      } else if (statusCode >= 400) {
        logger.warn(logMessage);
      } else {
        logger.info(logMessage);
      }
    },
  },
});

/**
 * Middleware to attach start time to request for execution time calculation
 */
export const attachStartTime = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  req.startTime = Date.now();
  next();
};

/**
 * Export the Winston logger for use in other parts of the application
 */
export { logger };

/**
 * Extend Express Request interface to include startTime
 */
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}
