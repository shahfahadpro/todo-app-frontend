export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export interface TodoList {
  id: string;
  title: string;
  completedTasks: number;
  totalTasks: number;
  items: TodoItem[];
}
