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
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper function to check if a task is high priority
 * A task is high priority if its due date is within 7 days from now
 * @param task - The task to check
 * @returns true if high priority, false otherwise
 */
export const isHighPriority = (task: Task): boolean => {
  if (!task.dueDate) {
    return false; // No due date = not high priority
  }

  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const diffInMs = dueDate.getTime() - now.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays <= 7 && diffInDays >= 0; // Within 7 days and not past due
};

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
  dueDate?: Date | string;
}): Task => {
  const now = new Date();
  const newTask: Task = {
    id: nextId++,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status,
    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  return newTask;
};

/**
 * Get all tasks, optionally filtered by status and sorted by priority
 * @param status - Optional status filter
 * @param sortByPriority - Optional flag to sort by high priority
 * @returns Array of tasks
 */
export const findAllTasks = (
  status?: TaskStatus,
  sortByPriority?: boolean,
): Task[] => {
  let result = status
    ? tasks.filter((task) => task.status === status)
    : [...tasks];

  // Sort by priority if requested
  if (sortByPriority) {
    result.sort((a, b) => {
      const aPriority = isHighPriority(a);
      const bPriority = isHighPriority(b);

      // High priority tasks come first
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;

      // If both are high/low priority, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1; // Tasks with due dates come before those without
      if (b.dueDate) return 1;

      return 0; // Keep original order
    });
  }

  return result;
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
    dueDate?: Date | string | null;
  },
): Task | undefined => {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return undefined;
  }

  // Handle dueDate update
  let processedDueDate: Date | undefined = tasks[taskIndex].dueDate;
  if ("dueDate" in updates) {
    if (updates.dueDate === null) {
      processedDueDate = undefined; // Clear due date
    } else if (updates.dueDate) {
      processedDueDate = new Date(updates.dueDate);
    }
  }

  const updatedTask: Task = {
    ...tasks[taskIndex],
    title: updates.title !== undefined ? updates.title : tasks[taskIndex].title,
    description:
      updates.description !== undefined
        ? updates.description
        : tasks[taskIndex].description,
    status:
      updates.status !== undefined ? updates.status : tasks[taskIndex].status,
    dueDate: processedDueDate,
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
