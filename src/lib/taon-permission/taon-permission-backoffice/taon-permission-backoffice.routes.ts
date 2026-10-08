//#region imports
import { Routes } from '@angular/router';

import { taonBackofficeDetailsResolver } from '../../taon-session/taon-session-backoffice/taon-backoffice-details.resolver';
import { TaonPermissionApiService } from '../taon-permission-api.service';
//#endregion

export const TaonPermissionBackofficeRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./taon-permission-backoffice.component').then(
        m => m.TaonPermissionBackofficeComponent,
      ),
  },
  {
    path: ':id',
    data: { kind: 'permission', hideInNavigation: true },
    providers: [TaonPermissionApiService],
    resolve: { detail: taonBackofficeDetailsResolver },
    loadComponent: () =>
      import('../../taon-session/taon-session-backoffice/taon-backoffice-details-page.component').then(
        m => m.TaonBackofficeDetailsPageComponent,
      ),
  },
];

/**
 * By default exporting TaonPermissionBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonPermissionBackofficeRoutes;
