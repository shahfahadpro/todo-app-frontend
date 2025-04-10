import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'todos',
    loadChildren: () => import('@/modules/todos/todos.module').then(m => m.TodosModule),
  },
  { path: '', redirectTo: '/todos', pathMatch: 'full' },
];
