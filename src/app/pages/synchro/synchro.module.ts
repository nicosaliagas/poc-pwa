import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SynchroRoutingModule } from './synchro-routing.module';
import { SynchroComponent } from './synchro.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SynchroRoutingModule,
  ],
  declarations: [
    SynchroComponent
  ]
})
export class SynchroModule { }
