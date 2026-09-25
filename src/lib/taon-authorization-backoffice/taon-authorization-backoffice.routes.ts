//#region imports
import { Routes } from '@angular/router';
import { adminLazyRoute } from '@taon-dev/ui/src';
//#endregion

export const TaonAuthorizationBackofficeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-authorization-backoffice.component').then(
        m => m.TaonAuthorizationBackofficeComponent,
      ),

    children: [
      adminLazyRoute({
        path: 'groups',
        menuItem: 'Groups',
        icon: 'groups',
        expandable: false,
        loader: () =>
          import('../taon-group/taon-group-backoffice/taon-group-backoffice.routes').then(
            m => m.TaonGroupBackofficeRoutes,
          ),
      }),
      adminLazyRoute({
        path: 'roles',
        menuItem: 'Roles',
        icon: 'recent_actors',
        expandable: false,
        loader: () =>
          import('../taon-role/taon-role-backoffice/taon-role-backoffice.routes').then(
            m => m.TaonRoleBackofficeRoutes,
          ),
      }),
      adminLazyRoute({
        path: 'permissions',
        menuItem: 'Permissions',
        icon: 'approval',
        expandable: false,
        loader: () =>
          import('../taon-permission/taon-permission-backoffice/taon-permission-backoffice.routes').then(
            m => m.TaonPermissionBackofficeRoutes,
          ),
      }),
    ],
  },
];

/**
 * By default exporting TaonAuthorizationBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonAuthorizationBackofficeRoutes;
