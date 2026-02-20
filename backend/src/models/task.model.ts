/**
 * Task Status Enum
 * Defines the possible states of a task
 */
export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

/**
 * Task Interface
 * Represents the structure of a task entity
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * In-memory task storage
 */
let tasks: Task[] = [];
let nextId = 1;

/**
 * Create a new task
 * @param taskData - Partial task data (without id and timestamps)
 * @returns The created task
 */
export const createTask = (taskData: {
  title: string;
  description?: string;
  status: TaskStatus;
}): Task => {
  const now = new Date();
  const newTask: Task = {
    id: nextId++,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  return newTask;
};

/**
 * Get all tasks, optionally filtered by status
 * @param status - Optional status filter
 * @returns Array of tasks
 */
export const findAllTasks = (status?: TaskStatus): Task[] => {
  if (status) {
    return tasks.filter((task) => task.status === status);
  }
  return [...tasks];
};

/**
 * Find a task by ID
 * @param id - Task ID
 * @returns The task if found, undefined otherwise
 */
export const findTaskById = (id: number): Task | undefined => {
  return tasks.find((task) => task.id === id);
};

/**
 * Update an existing task
 * @param id - Task ID
 * @param updates - Partial task data to update
 * @returns The updated task if found, undefined otherwise
 */
export const updateTask = (
  id: number,
  updates: {
    title?: string;
    description?: string;
    status?: TaskStatus;
  },
): Task | undefined => {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return undefined;
  }

  const updatedTask: Task = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date(),
  };
  tasks[taskIndex] = updatedTask;
  return updatedTask;
};

/**
 * Delete a task by ID
 * @param id - Task ID
 * @returns The deleted task if found, undefined otherwise
 */
export const deleteTask = (id: number): Task | undefined => {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return undefined;
  }

  const deletedTask = tasks[taskIndex];
  tasks.splice(taskIndex, 1);
  return deletedTask;
};
