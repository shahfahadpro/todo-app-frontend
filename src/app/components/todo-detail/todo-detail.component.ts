import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoList, TodoItem } from '@/shared/models/todo.model';
import { TodoStateService } from '@/services/todo-state.service';
import { Observable, map, switchMap, shareReplay, BehaviorSubject, of } from 'rxjs';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-detail.component.html',
  styleUrls: ['./todo-detail.component.scss'],
})
export class TodoDetailComponent implements OnInit {
  private todoStateService = inject(TodoStateService);

  readonly isAddingItemToList$: Observable<Set<string>> = this.todoStateService.isAddingItemToList$;
  readonly isTogglingItem$: Observable<Set<string>> = this.todoStateService.isTogglingItem$;

  private listIdSubject = new BehaviorSubject<string | null>(null);

  @Input()
  set listId(id: string | null) {
    this.listIdSubject.next(id);
  }

  get listIdValue(): string | null {
    return this.listIdSubject.getValue();
  }

  // Observable stream for the selected list's data
  list$: Observable<TodoList | undefined> | undefined;

  // Properties to bind to the new todo item inputs
  newTodoItemTitle: string = '';
  newTodoItemDescription: string = '';

  ngOnInit(): void {
    this.list$ = this.listIdSubject.pipe(
      switchMap(id => {
        if (id === null) {
          return of(undefined);
        } else {
          return this.todoStateService.todoLists$.pipe(
            map(lists => lists.find(list => list.id === id))
          );
        }
      }),
      shareReplay(1)
    );

    this.list$.subscribe(() => {
      this.newTodoItemTitle = '';
      this.newTodoItemDescription = '';
    });
  }

  // Method to add a new todo item via the service
  addItem(): void {
    const currentListId = this.listIdValue;
    if (currentListId !== null && this.newTodoItemTitle.trim()) {
      this.todoStateService.addItem(
        currentListId,
        this.newTodoItemTitle,
        this.newTodoItemDescription
      );
      this.newTodoItemTitle = '';
      this.newTodoItemDescription = '';
    }
  }

  // Method to toggle the completion status via the status
  toggleCompletion(item: TodoItem): void {
    const currentListId = this.listIdValue;
    if (currentListId !== null) {
      this.todoStateService.toggleItemCompletion(currentListId, item.id);
    }
  }
}
