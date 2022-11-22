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
    path: 'readonly',
    loadChildren: () =>
      import('./pages/readonly/readonly.module').then((mod) => mod.ReadonlyModule),
    data: { title: `Page lecture seule` },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
