//#region imports
import { Routes } from '@angular/router';
import { adminLazyRoute } from '@taon-dev/ui/src';
//#endregion

export const TaonSessionBackofficeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-session-backoffice.component').then(
        m => m.TaonSessionBackofficeComponent,
      ),

    children: [
      adminLazyRoute({
        path: 'user',
        menuItem: 'Users',
        icon: 'account_circle',
        expandable: true,
        loader: () =>
          import('../../taon-session-user/taon-session-backoffice-users/taon-session-backoffice-users.routes').then(
            m => m.TaonSessionBackofficeUsersRoutes,
          ),
      }),
    ],
  },
];

/**
 * By default exporting TaonSessionBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonSessionBackofficeRoutes;
