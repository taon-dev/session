//#region imports
import { Routes } from '@angular/router';
import { TaonAuthContextEntity } from '@taon-dev/session/src';
import { adminLazyRoute as adminLazyRouteBase } from '@taon-dev/ui/src';
//#endregion

const adminLazyRoute = adminLazyRouteBase<TaonAuthContextEntity>;

export const TaonBaselineBackofficeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-baseline-backoffice.component').then(
        m => m.TaonBaselineBackofficeComponent,
      ),

    children: [
      adminLazyRoute({
        isVisible: ({ context }) => context.isSuperUser || context.isLocalhostBackend,
        path: 'sudo',
        menuItem: 'Sudo',
        color: 'red',
        icon: 'supervisor_account',
        expandable: false,
        loader: () =>
          import('@taon-dev/sudo/src').then(m => m.TaonSudoBackofficeRoutes),
      }),
      adminLazyRoute({
        isDisabled: ({ context }) => !context.user,
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
        isDisabled: ({ context }) => !context.user,
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
        isDisabled: ({ context }) => !context.user,
        path: 'authorization',
        menuItem: 'Authorization',
        icon: 'apps',
        expandable: true,
        loader: () =>
          import('@taon-dev/session/src').then(
            m => m.TaonAuthorizationBackofficeRoutes,
          ),
      }),
      adminLazyRoute({
        isDisabled: ({ context }) => !context.user,
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
 * By default exporting TaonBaselineBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonBaselineBackofficeRoutes;
