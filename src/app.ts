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
import Aura from '@primeng/themes/aura'; // @browser
import {
  DEFAULT_SESSION_EMAIL,
  DEFAULT_SESSION_PASSWORD,
  TaonLoginConfig,
  TaonSessionContext,
  TaonSessionProvider,
  TaonSessionUser,
  TaonSessionUserRepository,
} from '@taon-dev/session/src';
import {
  TaonSessionComponent,
  TaonSessionButtonComponent,
} from '@taon-dev/session/src'; // @browser
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
} from 'taon/src';
import { TaonAdminService, TaonAdmin } from 'taon/src'; // @browser
import { TaonStor } from 'taon-storage/src';
import {
  TaonAdminModeConfigurationComponent,
  TaonNotFoundComponent,
  TaonThemeComponent,
  TaonThemeService,
} from 'taon-ui/src'; // @browser
import { Utils, UtilsOs } from 'tnp-core/src';

import { HOST_CONFIG } from './app.hosts';
import { ENV_ANGULAR_NODE_APP_BUILD_PWA_DISABLE_SERVICE_WORKER } from './lib/env/env.angular-node-app';
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
    TaonAdminModeConfigurationComponent,
    TaonSessionComponent,
    TaonSessionButtonComponent,
    JsonPipe,
  ],
  template: `
    <taon-admin-mode-configuration>
      @if (itemsLoaded()) {
        @if (navItems.length === 0 || forceShowBaseRootApp) {
          <mat-card class="m-2">
            <mat-card-content>
              <h3>Basic app info</h3>
              Name: taon-jwt-cookie-header-session<br />
              Angular version: {{ angularVersion }}<br />
              Taon backend: {{ taonMode }}<br />
              <taon-session-button [config]="config" />
            </mat-card-content>
          </mat-card>

          <mat-card class="m-2">
            <mat-card-content>
              <taon-session [config]="config" />
            </mat-card-content>
          </mat-card>
        }
        <footer
          class="text-center p-4 w-full select-none"
          (click)="taonAdminService.enableDeveloperIf5Timetap()">
          Copyright <strong>taon-jwt-cookie-header-session</strong> {{ year }}
        </footer>
      }
    </taon-admin-mode-configuration>
  `,
})
export class SessionApp implements OnInit {
  /**Required for proper theme*/

  config: TaonLoginConfig = {
    linkToDashboard: '/',
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

  forceShowBaseRootApp = false;

  private refresh = new BehaviorSubject<void>(undefined);

  get activePath(): string {
    return globalThis?.location.pathname?.split('?')[0];
  }

  navItems =
    SessionClientRoutes.length <= 1
      ? []
      : SessionClientRoutes.filter(r => r.path !== undefined).map(r => ({
          path: r.path === '' ? '/' : `/${r.path}`,
          label: r.path === '' ? 'Home' : `${r.path}`,
        }));

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
    redirectTo: () => {
      if (SessionClientRoutes.length === 1) {
        return '';
      }
      return SessionClientRoutes.find(r => r.path !== '')!.path!;
    },
  },
  // PUT ALL ROUTES HERE
  // @placeholder-for-routes

  // uncomment this to have NOT FOUND route
  // {
  //   path: '**',
  //   component: TaonNotFoundComponent,
  // },
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

//#region  taon-jwt-cookie-header-session context
var SessionContext = Taon.createContext(() => ({
  ...HOST_CONFIG['SessionContext'],
  contexts: { TaonBaseContext, TaonSessionContext },
  logs: {
    http: true,
    framework: true,
    // db: true,
  },
  session: true,
  database: true,
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
  const ref = await SessionContext.initialize();

  //#region add default email
  //#region @backend
  const ins = ref.getInstanceBy(TaonSessionUserRepository);

  const user = await ins.findOne({
    where: {
      email: DEFAULT_EMAIL,
    },
  });
  if (!user) {
    await ins.save(
      new TaonSessionUser().clone({
        email: DEFAULT_EMAIL,
        password: DEFAULT_PASSWORD,
      }),
    );
  }
  //#endregion
  //#endregion

  //#region initialize auto generated active contexts
  const autoGeneratedActiveContextsForApp: TaonContext[] = [
    // @placeholder-for-contexts-init
  ];

  const priorityContexts = [
    // put here manual priority for contexts if needed
  ];

  const activeContextsForApp: TaonContext[] = [
    ...priorityContexts,
    ...autoGeneratedActiveContextsForApp.filter(
      c => !priorityContexts.includes(c),
    ),
  ];

  for (const activeContext of activeContextsForApp) {
    await activeContext.initialize();
  }
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
