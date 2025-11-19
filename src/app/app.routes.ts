import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'principal',
    loadComponent: () =>
      import('./pages/principal/principal.page').then(m => m.PrincipalPage)
  },
  {
    path: '',
    redirectTo: 'principal',
    pathMatch: 'full',
  },
  {
    path: 'maps',
    loadComponent: () =>
      import('./pages/maps/maps.page').then(m => m.GamePage),
  },
  {
    path: 'fase-select',
    loadComponent: () =>
      import('./pages/fase-select/fase-select.page').then(m => m.FaseSelectPage)
  }
];
