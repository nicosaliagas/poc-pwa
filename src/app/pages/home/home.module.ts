import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LabelTodoPipe } from '../../../pipe/labelTodo.pipe';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ItemListComponent } from './item-list/item-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HomeRoutingModule,
  ],
  declarations: [
    HomeComponent,
    ItemListComponent,
    LabelTodoPipe,
  ]
})
export class HomeModule { }
