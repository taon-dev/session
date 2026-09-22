//#region imports
import { Routes } from '@angular/router';
import { adminLazyRoute } from '@taon-dev/ui/src';
//#endregion

export const AppBackofficeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./app-backoffice.component').then(m => m.AppBackofficeComponent),

    children: [
      adminLazyRoute({
        path: 'users',
        menuItem: 'Users',
        icon: 'manage_accounts',
        loader: () =>
          import('@taon-dev/session/src').then(
            m => m.TaonSessionBackofficeUsersRoutes,
          ),
      }),
      adminLazyRoute({
        path: 'session',
        menuItem: 'Session',
        icon: 'login',
        loader: () =>
          import('@taon-dev/session/src').then(
            m => m.TaonSessionBackofficeRoutes,
          ),
      }),
    ],
  },
];

/**
 * By default exporting AppBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default AppBackofficeRoutes;
