import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoDetailComponent } from '@/components/todo-detail/todo-detail.component';
import { TodoList } from '@/shared/models/todo.model';
import { TodoStateService } from '@/services/todo-state.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TodoDetailComponent],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  private todoStateService = inject(TodoStateService);

  // Expose state observables
  readonly todoLists$ = this.todoStateService.todoLists$;
  readonly isLoadingLists$ = this.todoStateService.isLoadingLists$;
  readonly isAddingList$ = this.todoStateService.isAddingList$;

  // Track selected list ID (now string or null)
  selectedListId: string | null = null;

  // Property for new list description input
  newListTitle: string = '';

  // Method to add a new list
  addList(): void {
    if (this.newListTitle.trim()) {
      this.todoStateService.addList(this.newListTitle.trim());
      this.newListTitle = ''; // Clear input
    }
  }

  // Method to select a list (accepts TodoList with string ID)
  selectList(list: TodoList): void {
    // If the clicked list is already selected, deselect it (set ID to null)
    // Otherwise, select the clicked list
    this.selectedListId = this.selectedListId === list.id ? null : list.id;
  }
}
