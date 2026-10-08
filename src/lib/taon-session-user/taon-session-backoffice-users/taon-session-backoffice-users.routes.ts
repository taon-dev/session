//#region imports
import { Routes } from '@angular/router';
import { TaonSessionUserApiService } from '../taon-session-user-api.service';
import { taonBackofficeDetailsResolver } from '../../taon-session/taon-session-backoffice/taon-backoffice-details.resolver';
//#endregion

export const TaonSessionBackofficeUsersRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./taon-session-backoffice-users.component').then(
        m => m.TaonSessionBackofficeUsersComponent,
      ),
  },
  {
    path: ':id',
    data: { kind: 'user', hideInNavigation: true },
    providers: [TaonSessionUserApiService],
    resolve: { detail: taonBackofficeDetailsResolver },
    loadComponent: () =>
      import('../../taon-session/taon-session-backoffice/taon-backoffice-details-page.component').then(
        m => m.TaonBackofficeDetailsPageComponent,
      ),
  },
];

/**
 * By default exporting TaonSessionBackofficeUsersRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonSessionBackofficeUsersRoutes;
