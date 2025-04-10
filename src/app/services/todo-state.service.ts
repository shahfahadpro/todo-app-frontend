import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TodoList } from '@/shared/models/todo.model';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TodoStateService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  // Use environment variables
  private readonly STORAGE_KEY = environment.storageKey;
  private readonly API_BASE_URL = environment.apiUrl;

  // --- State Subjects ---
  private readonly _todoLists$ = new BehaviorSubject<TodoList[]>([]);
  private readonly _isLoadingLists$ = new BehaviorSubject<boolean>(false); // Start as false initially
  private readonly _isAddingList$ = new BehaviorSubject<boolean>(false);
  private readonly _isAddingItemToList$ = new BehaviorSubject<Set<string>>(new Set());
  private readonly _isTogglingItem$ = new BehaviorSubject<Set<string>>(new Set());

  // --- Public Observables ---
  readonly todoLists$: Observable<TodoList[]> = this._todoLists$.asObservable();
  readonly isLoadingLists$: Observable<boolean> = this._isLoadingLists$.asObservable();
  readonly isAddingList$: Observable<boolean> = this._isAddingList$.asObservable();
  readonly isAddingItemToList$: Observable<Set<string>> = this._isAddingItemToList$.asObservable();
  readonly isTogglingItem$: Observable<Set<string>> = this._isTogglingItem$.asObservable();

  constructor() {
    // Try loading from local storage first
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const storedState = localStorage.getItem(this.STORAGE_KEY);
      if (storedState) {
        const parsedLists: TodoList[] = JSON.parse(storedState);
        // Basic validation (check if it's an array)
        if (Array.isArray(parsedLists)) {
          this._todoLists$.next(parsedLists);
          this._isLoadingLists$.next(false); // Data loaded, not loading
          return; // don't fetch from API
        } else {
          localStorage.removeItem(this.STORAGE_KEY); // Remove invalid data
        }
      }
    } catch (error) {
      localStorage.removeItem(this.STORAGE_KEY); // Remove potentially corrupt data
    }

    // If loading from storage failed or no data was found, fetch from API
    this.loadInitialLists(true);
  }

  private saveToLocalStorage(lists: TodoList[]): void {
    try {
      // Use constant for storage key
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving state to local storage:', error);
    }
  }

  // --- Data Loading ---
  loadInitialLists(showLoading: boolean = true): void {
    if (showLoading) {
      // Only set loading to true if we are showing the indicator
      this._isLoadingLists$.next(true);
    }

    interface ApiListItem {
      id: string;
      title: string;
      items: { id: string; title: string; description?: string; completed: boolean }[];
    }

    this.http
      .get<ApiListItem[]>(`${this.API_BASE_URL}/todos`)
      .pipe(
        finalize(() => {
          // Always set loading to false when the call finishes (success or error)
          this._isLoadingLists$.next(false);
        })
      )
      .subscribe({
        next: apiLists => {
          const processedLists: TodoList[] = apiLists.map(apiList => {
            const items = apiList.items || [];
            const totalTasks = items.length;
            const completedTasks = items.filter(item => item.completed).length;
            return {
              id: apiList.id,
              title: apiList.title,
              items: items,
              totalTasks: totalTasks,
              completedTasks: completedTasks,
            };
          });

          this._todoLists$.next(processedLists);
          this.saveToLocalStorage(processedLists);
        },
        error: err => {
          console.error('Error loading initial lists from API:', err);
          this.toastr.error('Failed to load lists.', 'Error:');
        },
      });
  }

  // --- State Modification Methods ---

  addList(listTitle: string): void {
    this._isAddingList$.next(true);
    const payload = { title: listTitle };
    this.http
      .post(`${this.API_BASE_URL}/todos`, payload, { observe: 'response' })
      .pipe(finalize(() => this._isAddingList$.next(false)))
      .subscribe({
        next: response => {
          if (response.status === 201) {
            this.loadInitialLists(false); // This will refresh state and save to local storage
          } else {
            console.warn(
              `List added via API but received status ${response.status}, refreshing state anyway...`
            );
            this.loadInitialLists(false);
          }
        },
        error: err => {
          console.error('Error adding list via API:', err);
          this.toastr.error('Failed to add the new list.', 'Error:');
        },
      });
  }

  addItem(listId: string, itemTitle: string, itemDescription: string): void {
    const currentAddingSet = this._isAddingItemToList$.getValue();
    this._isAddingItemToList$.next(new Set(currentAddingSet).add(listId));

    const payload = {
      title: itemTitle.trim(),
      description: itemDescription.trim() || undefined,
    };

    this.http
      .post(`${this.API_BASE_URL}/todos/${listId}/items`, payload, { observe: 'response' })
      .pipe(
        finalize(() => {
          const currentSet = this._isAddingItemToList$.getValue();
          currentSet.delete(listId);
          this._isAddingItemToList$.next(new Set(currentSet));
        })
      )
      .subscribe({
        next: response => {
          if (response.status === 201) {
            this.loadInitialLists(false);
          } else {
            console.warn(
              `Item added via API but received status ${response.status}, refreshing state anyway...`
            );
            this.loadInitialLists(false);
          }
        },
        error: err => {
          console.error(`Error adding item to list ${listId} via API:`, err);
          this.toastr.error('Failed to add the new item to the list.', 'Error:');
        },
      });
  }

  toggleItemCompletion(listId: string, itemId: string): void {
    const tempCurrentLists = this._todoLists$.getValue();
    const list = tempCurrentLists.find(l => l.id === listId);
    const item = list?.items.find(i => i.id === itemId);

    if (!list || !item) {
      console.error('List or item not found for toggling');
      return;
    }

    const newCompletedStatus = !item.completed;

    const currentTogglingSet = this._isTogglingItem$.getValue();
    this._isTogglingItem$.next(new Set(currentTogglingSet).add(itemId));

    const payload = { completed: newCompletedStatus };

    this.http
      .patch(`${this.API_BASE_URL}/todos/${listId}/items/${itemId}`, payload, {
        observe: 'response',
      })
      .pipe(
        finalize(() => {
          const currentSet = this._isTogglingItem$.getValue();
          currentSet.delete(itemId);
          this._isTogglingItem$.next(new Set(currentSet));
        })
      )
      .subscribe({
        next: response => {
          if (response.status === 200) {
            this.loadInitialLists(false);
          } else {
            console.warn(
              `Item status updated via API but received status ${response.status}, refreshing state anyway...`
            );
            this.loadInitialLists(false);
          }
        },
        error: err => {
          console.error(`Error updating item ${itemId} status via API:`, err);
          this.toastr.error('Failed to update item status.', 'Error:');
        },
      });
  }
}
