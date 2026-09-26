//#region imports
import * as os from 'os'; // @backend

import { AsyncPipe, JsonPipe, NgFor } from '@angular/common'; // @browser
import {
  inject,
  Injectable,
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
  mergeApplicationConfig,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core'; // @browser
import { Component } from '@angular/core'; // @browser
import { VERSION, OnInit } from '@angular/core'; // @browser
import { toSignal } from '@angular/core/rxjs-interop'; // @browser
import { MatButtonModule } from '@angular/material/button'; // @browser
import { MatCardModule } from '@angular/material/card'; // @browser
import { MatDialog } from '@angular/material/dialog'; // @browser
import { MatDividerModule } from '@angular/material/divider'; // @browser
import { MatIconModule } from '@angular/material/icon'; // @browser
import { MatListModule } from '@angular/material/list'; // @browser
import { MatTabsModule } from '@angular/material/tabs'; // @browser
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  provideRouter,
  Router,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
  ActivatedRoute,
  Routes,
  Route,
  withHashLocation,
  withComponentInputBinding,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { provideHotToastConfig } from '@ngneat/hot-toast'; // @browser
import Aura from '@primeng/themes/aura'; // @browser
import { TaonBaselineBackofficeOutletName } from '@taon-dev/baseline/src';
import {
  DEFAULT_SESSION_EMAIL,
  DEFAULT_SESSION_PASSWORD,
  TaonSessionConfig,
  TaonSessionAbstractContext,
  TaonSessionProvider,
  TaonSessionUserEntity,
  TaonSessionUserRepository,
  MIGRATIONS_CLASSES_FOR_SessionContext,
} from '@taon-dev/session/src';
import {
  TaonSessionComponent,
  TaonSessionButtonComponent,
} from '@taon-dev/session/src'; // @browser
import { TaonDraggableButtonPanelComponent } from '@taon-dev/ui/src'; // @browser
import { providePrimeNG } from 'primeng/config'; // @browser
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import {
  Taon,
  TaonBaseContext,
  TAON_CONTEXT,
  EndpointContext,
  TaonBaseAngularService,
  TaonEntity,
  StringColumn,
  TaonBaseAbstractEntity,
  TaonBaseCrudController,
  TaonController,
  GET,
  TaonMigration,
  TaonBaseMigration,
  TaonContext,
  TaonProvider,
  ClassHelpers,
} from 'taon/src';
import { TaonAdminService, TaonAdmin } from 'taon/src'; // @browser
import { TaonStor } from 'taon-storage/src';
import {
  TaonNotFoundComponent,
  TaonThemeComponent,
  TaonThemeService,
} from 'taon-ui/src'; // @browser
import { Utils, UtilsOs } from 'tnp-core/src';

import { HOST_CONFIG } from './app.hosts';
import {
  ENV_ANGULAR_NODE_APP_BUILD_PWA_DISABLE_SERVICE_WORKER,
  ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_CLIENT_ID,
  ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_SECRET,
} from './lib/env/env.angular-node-app';
// @placeholder-for-imports
//#endregion

//#region constants
console.log('🚀 [ TAON IS STARTING ]');
const DEFAULT_PASSWORD = DEFAULT_SESSION_PASSWORD;

const DEFAULT_EMAIL = DEFAULT_SESSION_EMAIL;
//#endregion

//#region taon-jwt-cookie-header-session component
//#region @browser
@Component({
  selector: 'app-root',

  imports: [
    // RouterOutlet,
    AsyncPipe,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatListModule,
    MatTabsModule,
    RouterModule,
    TaonDraggableButtonPanelComponent,
    TaonSessionComponent,
    TaonSessionButtonComponent,
    JsonPipe,
  ],
  template: `
    @if (itemsLoaded()) {
      <mat-card class="m-2">
        <mat-card-content>
          <h3>Basic app info</h3>
          Name: taon-jwt-cookie-header-session<br />
          Angular version: {{ angularVersion }}<br />
          Taon backend: {{ taonMode }}<br />
          <div class="flex  flex-row items-center justify-center">
            <taon-session-button [config]="config" />

            <taon-draggable-button-panel
              title="Taon Admin"
              [outlet]="outlet"
              [basePath]="basePath">
              <router-outlet [name]="outlet" />
            </taon-draggable-button-panel>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="m-2">
        <mat-card-content>
          <taon-session [config]="config" />
        </mat-card-content>
      </mat-card>
      <router-outlet></router-outlet>
    }
  `,
  // <footer
  //       class="text-center p-4 w-full select-none"
  //       (click)="taonAdminService.enableDeveloperIf5Timetap()">
  //       Copyright <strong>taon-jwt-cookie-header-session</strong> {{ year }}
  //     </footer>
})
export class SessionApp implements OnInit {
  /**Required for proper theme*/

  config: TaonSessionConfig = {
    // linkToDashboard: '/',
    // defaultEmail: DEFAULT_EMAIL,
    // defaultPassword: DEFAULT_PASSWORD,
  };

  theme = inject(TaonThemeService);

  taonAdminService = inject(TaonAdminService);

  dialog = inject(MatDialog);

  activatedRoute = inject(ActivatedRoute);

  router = inject(Router);

  itemsLoaded = signal(false);

  year = new Date().getFullYear();

  taonMode = UtilsOs.isRunningInWebSQL() ? 'websql' : 'normal nodejs';

  angularVersion = VERSION.full;

  outlet = TaonBaselineBackofficeOutletName;

  forceShowBaseRootApp = false;

  basePath!: string;

  private refresh = new BehaviorSubject<void>(undefined);

  get activePath(): string {
    return globalThis?.location.pathname?.split('?')[0];
  }

  openDialog(
    enterAnimationDuration: string | number,
    exitAnimationDuration: string | number,
  ): void {
    this.dialog.open(TaonThemeComponent, {
      width: '400px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  ngOnInit(): void {
    this.basePath = SessionClientRoutes.find(
      c => c.outlet === TaonBaselineBackofficeOutletName,
    )?.path!;
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(globalThis?.location.pathname);
    // TODO set below from 1000 to zero in production
    Taon.removeLoader().then(() => {
      this.itemsLoaded.set(true);
    });
  }

  navigateTo(item: { path: string; label: string }): void {
    if (item.path === '/') {
      if (this.forceShowBaseRootApp) {
        return;
      }
      this.forceShowBaseRootApp = true;
      return;
    }
    this.forceShowBaseRootApp = false;
    this.router.navigateByUrl(item.path);
  }
}
//#endregion
//#endregion

//#region  taon-jwt-cookie-header-session routes
//#region @browser
export const SessionServerRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
export const SessionClientRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app',
  },
  {
    // SessionExampleRoutes
    path: 'app',
    loadChildren: () =>
      import('./app/session-example/session-example.routes').then(
        m => m.SessionExampleRoutes,
      ),
  },
  {
    path: 'backoffice',
    outlet: TaonBaselineBackofficeOutletName,
    providers: [
      {
        provide: TAON_CONTEXT,
        useFactory: () => SessionContext,
      },
    ],
    loadChildren: () =>
      import('./app/baseline-backoffice/taon-baseline-backoffice.routes').then(
        m => m.TaonBaselineBackofficeRoutes,
      ),
  },
];
//#endregion
//#endregion

//#region  taon-jwt-cookie-header-session app configs
//#region @browser
export const SessionAppConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    {
      provide: TAON_CONTEXT,
      useFactory: () => SessionContext,
    },
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => SessionStartFunction,
    },
    provideHotToastConfig({
      position: 'top-right',
    }),
    provideBrowserGlobalErrorListeners(),
    // remove withHashLocation() to use SSR
    provideRouter(
      SessionClientRoutes,
      withHashLocation(),
      withComponentInputBinding(),
    ),
    provideClientHydration(withEventReplay()),
    provideServiceWorker('ngsw-worker.js', {
      enabled:
        !isDevMode() && !ENV_ANGULAR_NODE_APP_BUILD_PWA_DISABLE_SERVICE_WORKER,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};

export const SessionServerConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(SessionServerRoutes))],
};

export const SessionConfig = mergeApplicationConfig(
  SessionAppConfig,
  SessionServerConfig,
);
//#endregion
//#endregion

//#region taon sesssion providers decorator
@TaonProvider({
  className: 'TaonSessionProvider',
})
class TaonSessionProviderOverride extends TaonSessionProvider {
  constructor() {
    super();
    this.socialLogin.google.enabled = true;
    this.socialLogin.google.googleClientId =
      ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_CLIENT_ID;
  }

  //#region @backend
  async _() {
    const googleSecret = await ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_SECRET();
    this.socialLogin.google.googleSecret = googleSecret;
    await super._();
  }
  //#endregion
}
//#endregion

//#region  taon-jwt-cookie-header-session context
var SessionContext = Taon.createContext(() => ({
  ...HOST_CONFIG['SessionContext'],
  contexts: {
    TaonBaseContext,
    TaonSessionAbstractContext,
  },
  migrations: {
    ...MIGRATIONS_CLASSES_FOR_SessionContext,
  },
  // logs: true,
  logs: {
    // http: true,
    // framework: true,
    // routes: true,
    // db: true,
  },
  providers: {
    [ClassHelpers.getName(TaonSessionProvider)]: TaonSessionProviderOverride,
  },

  session: true,
  database: {
    recreateMode: 'DROP_DB__RUN_MIGRATIONS',
  },
  disabledRealtime: true,
}));
//#endregion

//#region  taon-jwt-cookie-header-session start function
export const SessionStartFunction = async (
  startParams?: Taon.StartParams,
): Promise<void> => {
  //#region @browser
  TaonAdmin.init();
  await TaonStor.awaitAll();
  //#endregion
  const ref = await SessionContext.initialize(startParams);

  //#region add default email
  //#region @backend
  const ins = ref.getInstanceBy(TaonSessionUserRepository);

  // const user = await ins.findOne({
  //   where: {
  //     email: DEFAULT_EMAIL,
  //   },
  // });
  // if (!user) {
  //   await ins.save(
  //     new TaonSessionUserEntity().clone({
  //       email: DEFAULT_EMAIL,
  //       password: DEFAULT_PASSWORD,
  //     }),
  //   );
  // }
  //#endregion
  //#endregion

  //#region @backend
  if (
    startParams?.onlyMigrationRun ||
    startParams?.onlyMigrationRevertToTimestamp
  ) {
    process.exit(0);
  }
  //#endregion

  //#region @backend
  console.log(`Hello in NodeJs backend! os=${os.platform()}`);
  //#endregion
};
//#endregion

//#region default export
export default SessionStartFunction;
//#endregion
