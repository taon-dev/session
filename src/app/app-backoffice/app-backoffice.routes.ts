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
        expandable: false,
        loader: () =>
          import('@taon-dev/session/src').then(
            m => m.TaonSessionBackofficeUsersRoutes,
          ),
      }),
      adminLazyRoute({
        path: 'session',
        menuItem: 'Sessions',
        expandable: false,
        icon: 'login',
        loader: () =>
          import('@taon-dev/session/src').then(
            m => m.TaonSessionBackofficeRoutes,
          ),
      }),
      adminLazyRoute({
        path: 'emails',
        menuItem: 'Emails',
        expandable: false,
        icon: 'email',
        loader: () =>
          import('@taon-dev/emails/src').then(
            m => m.TaonEmailsBackofficeRoutes,
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
