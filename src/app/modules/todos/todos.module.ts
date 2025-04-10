import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TodosRoutingModule } from './todos-routing.module';
import { TodoListComponent } from '@/components/todo-list/todo-list.component';
import { TodoDetailComponent } from '@/components/todo-detail/todo-detail.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, TodosRoutingModule, TodoListComponent, TodoDetailComponent],
})
export class TodosModule {}
