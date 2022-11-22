import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ReadonlyRoutingModule } from './readonly-routing.module';
import { ReadonlyComponent } from './readonly.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReadonlyRoutingModule,
  ],
  declarations: [
    ReadonlyComponent
  ]
})
export class ReadonlyModule { }
