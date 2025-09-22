import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'map1',
    loadComponent: () => import('./pages/map1/map1.page').then((m) => m.GamePage),
  },
  {
    path: '',
    redirectTo: 'map1',
    pathMatch: 'full',
  },
  {
    path: 'map2',
    loadComponent: () => import('./pages/map2/map2.page').then( m => m.GamePage)
  },
  {
    path: 'map3',
    loadComponent: () => import('./pages/map3/map3.page').then( m => m.GamePage)
  },
  {
    path: 'map4',
    loadComponent: () => import('./pages/map4/map4.page').then( m => m.GamePage)
  },


];
