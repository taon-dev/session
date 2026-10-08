//#region @browser
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, PRIMARY_OUTLET, Router, UrlTree } from '@angular/router';

export type TaonBackofficeEntity = 'user' | 'group' | 'role' | 'permission';

@Injectable()
export class TaonBackofficeNavigationService {
  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  detailsLink(entity: TaonBackofficeEntity, id: number | string): UrlTree {
    const ancestry = this.route.snapshot.pathFromRoot;
    const outletRoot = ancestry.find(route => route.outlet !== PRIMARY_OUTLET);
    if (!outletRoot) {
      throw new Error('Session backoffice details require an admin outlet');
    }
    //#endregion

    const scope = ancestry.find(route =>
      route.routeConfig?.children?.some(child => child.path === 'authorization'),
    );
    if (!scope) {
      throw new Error(
        'Session backoffice authorization routes are not configured',
      );
    }

    const base = scope.pathFromRoot
      .slice(ancestry.indexOf(outletRoot))
      .flatMap(route => route.url.map(segment => segment.path));
    const userPath = scope.routeConfig.children.some(
      child => child.path === 'users',
    )
      ? ['users']
      : ['session', 'user'];
    const target =
      entity === 'user' ? userPath : ['authorization', `${entity}s`];
    const [first, ...rest] = [...base, ...target, String(id)];
    const currentOutlet =
      this.router.parseUrl(this.router.url).root.children[outletRoot.outlet];

    // Match the admin layout: replace only its outlet and retain its base matrix parameters.
    return this.router.createUrlTree([
      {
        outlets: {
          [outletRoot.outlet]: [
            first,
            { ...currentOutlet?.segments[0]?.parameters },
            ...rest,
          ],
        },
      },
    ]);
  }

  openDetails(entity: TaonBackofficeEntity, id: number | string): void {
    void this.router.navigateByUrl(this.detailsLink(entity, id));
  }
}
