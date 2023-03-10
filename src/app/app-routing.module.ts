import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.module').then((mod) => mod.HomeModule),
    data: { title: `Home` },
  },
  {
    path: 'synchro',
    loadChildren: () =>
      import('./pages/synchro/synchro.module').then((mod) => mod.SynchroModule),
    data: { title: `Page synchro` },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
