import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'watch/:id',
    loadComponent: () => import('./pages/watch/watch').then((m) => m.Watch),
  },
];
