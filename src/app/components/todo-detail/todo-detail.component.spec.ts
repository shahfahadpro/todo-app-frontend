import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms'; // Needed for ngModel
import { BehaviorSubject, Observable } from 'rxjs';

import { TodoDetailComponent } from './todo-detail.component';
import { TodoStateService } from '@/services/todo-state.service';
import { TodoList, TodoItem } from '@/shared/models/todo.model';

// Mock Data
const MOCK_LIST_ID = 'list-abc';
const MOCK_ITEM_1: TodoItem = { id: 'item-1', title: 'Mock Item 1', completed: false };
const MOCK_LIST: TodoList = {
  id: MOCK_LIST_ID,
  title: 'Mock List Title',
  items: [MOCK_ITEM_1, { id: 'item-2', title: 'Mock Item 2', completed: true }],
  completedTasks: 1,
  totalTasks: 2,
};

// Mock TodoStateService
const mockTodoStateService = {
  // Component needs todoLists$ to find the list based on listId input
  _todoLists$: new BehaviorSubject<TodoList[]>([MOCK_LIST]),
  get todoLists$(): Observable<TodoList[]> {
    return this._todoLists$.asObservable();
  },

  // Dummy observables needed for template bindings
  _isAddingItemToList$: new BehaviorSubject<Set<string>>(new Set()),
  _isTogglingItem$: new BehaviorSubject<Set<string>>(new Set()),
  get isAddingItemToList$(): Observable<Set<string>> {
    return this._isAddingItemToList$.asObservable();
  },
  get isTogglingItem$(): Observable<Set<string>> {
    return this._isTogglingItem$.asObservable();
  },

  // Spies for methods called by the component
  addItem: jasmine.createSpy('addItem'),
  toggleItemCompletion: jasmine.createSpy('toggleItemCompletion'),

  // Reset spies and state
  reset(): void {
    this.addItem.calls.reset();
    this.toggleItemCompletion.calls.reset();
    this._todoLists$.next([MOCK_LIST]);
    this._isAddingItemToList$.next(new Set());
    this._isTogglingItem$.next(new Set());
  },
};

describe('TodoDetailComponent (Basic Tests)', () => {
  let component: TodoDetailComponent;
  let fixture: ComponentFixture<TodoDetailComponent>;
  let nativeElement: HTMLElement;
  let stateService: typeof mockTodoStateService;

  beforeEach(async () => {
    // Reset mock service state
    mockTodoStateService.reset();

    await TestBed.configureTestingModule({
      imports: [TodoDetailComponent, FormsModule],
      providers: [{ provide: TodoStateService, useValue: mockTodoStateService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoDetailComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement;
    stateService = TestBed.inject(TodoStateService) as unknown as typeof mockTodoStateService;
  });

  // Test 1: Component Creation
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Input Handling & Basic Display
  it('should display the list title when listId input is set', () => {
    component.listId = MOCK_LIST_ID;

    fixture.detectChanges();

    const titleElement = nativeElement.querySelector('h3');
    expect(titleElement).toBeTruthy();
    expect(titleElement?.textContent).toContain(MOCK_LIST.title);
  });

  it('should NOT display details if listId input is null', () => {
    component.listId = null;
    fixture.detectChanges();

    const detailContainer = nativeElement.querySelector('.border.border-gray-200'); // Adjust selector based on your actual template structure
    expect(detailContainer).toBeFalsy();
  });

  // Test 3: Method Call -> Service Interaction (addItem)
  it('should call service.addItem when addItem() is called with valid data', () => {
    component.listId = MOCK_LIST_ID;
    fixture.detectChanges();

    const testTitle = 'New Task';
    const testDesc = 'Task Description';
    component.newTodoItemTitle = testTitle;
    component.newTodoItemDescription = testDesc;

    component.addItem();

    expect(stateService.addItem).toHaveBeenCalled();
    expect(stateService.addItem).toHaveBeenCalledWith(MOCK_LIST_ID, testTitle, testDesc);

    expect(component.newTodoItemTitle).toBe('');
    expect(component.newTodoItemDescription).toBe('');
  });

  it('should NOT call service.addItem if title is empty', () => {
    component.listId = MOCK_LIST_ID;
    fixture.detectChanges();

    component.newTodoItemTitle = '';
    component.newTodoItemDescription = 'Some Desc';

    component.addItem();

    expect(stateService.addItem).not.toHaveBeenCalled();
  });

  it('should NOT call service.addItem if listId is null', () => {
    component.listId = null;
    fixture.detectChanges();

    component.newTodoItemTitle = 'A Title';
    component.newTodoItemDescription = 'Some Desc';

    component.addItem();

    expect(stateService.addItem).not.toHaveBeenCalled();
  });

  // Test 4: Method Call -> Service Interaction (toggleCompletion)
  it('should call service.toggleItemCompletion when toggleCompletion() is called', () => {
    component.listId = MOCK_LIST_ID;
    fixture.detectChanges();

    component.toggleCompletion(MOCK_ITEM_1);

    expect(stateService.toggleItemCompletion).toHaveBeenCalled();
    expect(stateService.toggleItemCompletion).toHaveBeenCalledWith(MOCK_LIST_ID, MOCK_ITEM_1.id);
  });

  it('should NOT call service.toggleItemCompletion if listId is null', () => {
    component.listId = null;
    fixture.detectChanges();

    component.toggleCompletion(MOCK_ITEM_1);

    expect(stateService.toggleItemCompletion).not.toHaveBeenCalled();
  });
});
