//#region imports
import { Routes } from '@angular/router';
import { TaonRoleApiService } from '../taon-role-api.service';
import { taonBackofficeDetailsResolver } from '../../taon-session/taon-session-backoffice/taon-backoffice-details.resolver';
//#endregion

export const TaonRoleBackofficeRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./taon-role-backoffice.component').then(
        m => m.TaonRoleBackofficeComponent,
      ),
  },
  {
    path: ':id',
    data: { kind: 'role', hideInNavigation: true },
    providers: [TaonRoleApiService],
    resolve: { detail: taonBackofficeDetailsResolver },
    loadComponent: () =>
      import('../../taon-session/taon-session-backoffice/taon-backoffice-details-page.component').then(
        m => m.TaonBackofficeDetailsPageComponent,
      ),
  },
];

/**
 * By default exporting TaonRoleBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonRoleBackofficeRoutes;
