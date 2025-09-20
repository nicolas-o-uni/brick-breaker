import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: 'principal',
    loadComponent: () => import('./pages/principal/principal.page').then(m => m.PrincipalPage)
  },
  {
    path: '',
    redirectTo: 'principal',
    pathMatch: 'full',
  },
  {
    path: 'map1',
    loadComponent: () => import('./pages/map1/map1.page').then((m) => m.GamePage),
  },
  {
    path: 'map2',
    loadComponent: () => import('./pages/map2/map2.page').then(m => m.GamePage)
  },
];


