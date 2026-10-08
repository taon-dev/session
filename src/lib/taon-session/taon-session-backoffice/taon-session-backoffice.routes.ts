//#region imports
import { Routes } from '@angular/router';
import { adminLazyRoute } from '@taon-dev/ui/src';
import { taonBackofficeDetailsResolver } from './taon-backoffice-details.resolver';
import { TaonSessionBackofficeApiService } from './taon-session-backoffice.api.service';
//#endregion

export const TaonSessionBackofficeRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./taon-session-backoffice.component').then(
        m => m.TaonSessionBackofficeComponent,
      ),
  },
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
  {
    path: ':id',
    data: { kind: 'session', hideInNavigation: true },
    providers: [TaonSessionBackofficeApiService],
    resolve: { detail: taonBackofficeDetailsResolver },
    loadComponent: () =>
      import('./taon-backoffice-details-page.component').then(
        m => m.TaonBackofficeDetailsPageComponent,
      ),
  },
];

/**
 * By default exporting TaonSessionBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonSessionBackofficeRoutes;
