import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SynchroComponent } from './synchro.component';

const routes: Routes = [
  { path: '', component: SynchroComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SynchroRoutingModule { }