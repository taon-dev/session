//#region imports
import { Routes } from '@angular/router';

import { taonBackofficeDetailsResolver } from '../../taon-session/taon-session-backoffice/taon-backoffice-details.resolver';
import { TaonGroupApiService } from '../taon-group-api.service';
//#endregion

export const TaonGroupBackofficeRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./taon-group-backoffice.component').then(
        m => m.TaonGroupBackofficeComponent,
      ),
  },
  {
    path: ':id',
    data: { kind: 'group', hideInNavigation: true },
    providers: [TaonGroupApiService],
    resolve: { detail: taonBackofficeDetailsResolver },
    loadComponent: () =>
      import('../../taon-session/taon-session-backoffice/taon-backoffice-details-page.component').then(
        m => m.TaonBackofficeDetailsPageComponent,
      ),
  },
];

/**
 * By default exporting TaonGroupBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonGroupBackofficeRoutes;
