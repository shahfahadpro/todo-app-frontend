import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { TodoListComponent } from './todo-list.component';
import { TodoStateService } from '@/services/todo-state.service';
import { TodoList } from '@/shared/models/todo.model';

// Simplified Mock Data
const MOCK_LIST: TodoList = {
  id: 'list-1',
  title: 'Groceries',
  items: [],
  completedTasks: 1,
  totalTasks: 3,
};

// Simplified Mock TodoStateService
const mockTodoStateService = {
  todoLists$: new BehaviorSubject<TodoList[]>([]).asObservable(),
  isLoadingLists$: new BehaviorSubject<boolean>(false).asObservable(),
  isAddingList$: new BehaviorSubject<boolean>(false).asObservable(),

  // Spy on the essential method called by the component
  addList: jasmine.createSpy('addList'),
};

@Component({
  selector: 'app-todo-detail',
  template: '',
  standalone: true,
})
class MockTodoDetailComponent {
  @Input() listId: string | null = null;
}

describe('TodoListComponent (Basic Tests)', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let nativeElement: HTMLElement;
  let stateService: typeof mockTodoStateService;

  beforeEach(async () => {
    // Reset spies before each test
    mockTodoStateService.addList.calls.reset();

    await TestBed.configureTestingModule({
      imports: [TodoListComponent, FormsModule, MockTodoDetailComponent],
      providers: [{ provide: TodoStateService, useValue: mockTodoStateService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement;
    stateService = TestBed.inject(TodoStateService) as unknown as typeof mockTodoStateService;
    fixture.detectChanges();
  });

  // Test 1: Component Creation
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Basic Template Check
  it('should display the main title "My Todo Lists"', () => {
    const titleElement = nativeElement.querySelector('h2');
    expect(titleElement).toBeTruthy();
    expect(titleElement?.textContent).toContain('My Todo Lists');
  });

  // Test 3: Method Call -> Service Interaction
  it('should call TodoStateService.addList when addList() is called with a title', () => {
    const testTitle = 'A New List';
    component.newListTitle = testTitle;
    component.addList();
    expect(stateService.addList).toHaveBeenCalled();
    expect(stateService.addList).toHaveBeenCalledWith(testTitle);
  });

  // Test 4: Component State Change
  it('should update selectedListId when selectList() is called', () => {
    expect(component.selectedListId).toBeNull();
    component.selectList(MOCK_LIST);
    expect(component.selectedListId).toBe(MOCK_LIST.id);
  });
});
