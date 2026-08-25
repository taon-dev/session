//#region imports

import type express from 'express';
import * as jwt from 'jsonwebtoken'; // @backend
import { TaonBaseKvRepository, TaonRepository } from 'taon/src';

import { TaonSessionProvider } from './taon-session.provider';

//#endregion

@TaonRepository({
  className: 'TaonSessionKvRepository',
})
export class TaonSessionKvRepository extends TaonBaseKvRepository {
  taonSessionProvider = this.injectProvider(TaonSessionProvider);

  //#region create access token
  public createAccessToken(userId: string): string {
    //#region @backendFunc
    return jwt.sign({ userId }, this.taonSessionProvider.ACCESS_TOKEN_SECRET, {
      expiresIn: this.taonSessionProvider.ACCESS_TOKEN_EXPIRES,
    });
    //#endregion
  }
  //#endregion

  //#region create refresh token
  public createRefreshToken(userId: string): string {
    //#region @backendFunc
    const crypto = require('crypto');
    const rtId = crypto.randomUUID();

    const expiresAt =
      Date.now() +
      this.taonSessionProvider.REFRESH_TOKEN_EXPIRES_SECONDS * 1000;

    this.set(rtId, { userId, expiresAt });

    const token = jwt.sign(
      { rtId },
      this.taonSessionProvider.REFRESH_TOKEN_SECRET,
      {
        expiresIn: this.taonSessionProvider.REFRESH_TOKEN_EXPIRES_SECONDS,
      },
    );

    return token;
    //#endregion
  }
  //#endregion

  //#region set auth cookies
  public setAuthCookies(
    res: express.Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    //#region @backendFunc
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // set true in production (HTTPS)
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 15,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/refresh',
      maxAge: 1000 * this.taonSessionProvider.REFRESH_TOKEN_EXPIRES_SECONDS,
    });
    //#endregion
  }
  //#endregion

  //#region clear auth cookies
  public clearAuthCookies(res: express.Response): void {
    //#region @backendFunc
    res.cookie('accessToken', '', { maxAge: 0 });
    res.cookie('refreshToken', '', { maxAge: 0 });
    //#endregion
  }
  //#endregion

  //#region get token from request
  public getTokenFromRequest(req: express.Request): string | null {
    //#region @backendFunc
    const cookieToken = req.cookies?.accessToken;

    const authHeader = req.headers['authorization'];
    const headerToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    return cookieToken || headerToken || null;
    //#endregion
  }
  //#endregion
}
