//#region imports
import jwt from 'jsonwebtoken'; // @backend
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  GET,
  TaonBaseController,
  Body,
  POST,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonSessionKvRepository } from './taon-session-kv.repository';
import { TaonSessionUser } from './taon-session-user.entity';
import { TaonSessionUserRepository } from './taon-session-user.repository';
import { TaonSessionMiddleware } from './taon-session.middleware';
import { TaonSession } from './taon-session.models';
import { TaonSessionProvider } from './taon-session.provider';
//#endregion

@TaonController({
  className: 'TaonSessionController',
})
export class TaonSessionController extends TaonBaseController {
  taonSessionKvRepository = this.injectKvRepository(TaonSessionKvRepository);

  taonSessionProvider = this.injectProvider(TaonSessionProvider);

  taonSessionUserRepository = this.injectCustomRepo(TaonSessionUserRepository);

  //#region login
  @POST()
  login(@Body() data: TaonSession.TaonLoginData): Taon.Response<boolean> {
    //#region @backendFunc
    return async (req, res) => {
      const { email, password } = data || {};

      const user = await this.taonSessionUserRepository.findOne({
        where: {
          email,
          password,
        },
      });

      if (!user) {
        Taon.error({
          status: 401,
          message: 'Invalid credentials',
        });
        return false;
      }

      const accessToken = this.taonSessionKvRepository.createAccessToken(
        user.id,
      );
      const refreshToken = this.taonSessionKvRepository.createRefreshToken(
        user.id,
      );

      this.taonSessionKvRepository.setAuthCookies(
        res!,
        accessToken,
        refreshToken,
      );

      return true;
    };
    //#endregion
  }
  //#endregion

  //#region refresh
  @POST()
  refresh(): Taon.Response<boolean> {
    //#region @backendFunc
    return async (req, res) => {
      const token = req!.cookies?.refreshToken;

      if (!token) {
        Taon.error({
          status: 401,
          message: 'No refresh token',
        });
        return false;
      }

      try {
        const payload = jwt.verify(
          token,
          this.taonSessionProvider.REFRESH_TOKEN_SECRET,
        ) as any;

        const session = await this.taonSessionKvRepository.get(payload.rtId);

        if (!session) {
          Taon.error({
            status: 401,
            message: 'Invalid refresh token',
          });
          return false;
        }

        if (session.expiresAt < Date.now()) {
          await this.taonSessionKvRepository.delete(payload.rtId);
          Taon.error({
            status: 401,
            message: 'Expired refresh token',
          });
          return false;
        }

        // ROTATION (important)
        await this.taonSessionKvRepository.delete(payload.rtId);

        const newAccessToken = this.taonSessionKvRepository.createAccessToken(
          session.userId,
        );
        const newRefreshToken = this.taonSessionKvRepository.createRefreshToken(
          session.userId,
        );

        this.taonSessionKvRepository.setAuthCookies(
          res!,
          newAccessToken,
          newRefreshToken,
        );

        return true;
      } catch {
        Taon.error({
          status: 401,
          message: 'Invalid refresh token',
        });
        return false;
      }
    };
    //#endregion
  }
  //#endregion

  //#region logout
  @POST()
  logout(): Taon.Response<boolean> {
    //#region @backendFunc
    return async (req, res) => {
      const token = req!.cookies?.refreshToken;

      if (token) {
        try {
          const payload = jwt.verify(
            token,
            this.taonSessionProvider.REFRESH_TOKEN_SECRET,
          ) as any;
          await this.taonSessionKvRepository.delete(payload.rtId);
        } catch (error) {
          console.error(error);
          return false;
        }
      }

      this.taonSessionKvRepository.clearAuthCookies(res!);
      return true;
    };
    //#endregion
  }
  //#endregion

  //#region me
  @GET({
    middlewares: ({ parentMiddlewares }) => ({
      TaonSessionMiddleware,
      ...parentMiddlewares,
    }),
  })
  me(): Taon.Response<string> {
    //#region @backendFunc
    return async (req, res) => {
      const userId = (req as any)!.userId;
      return userId;
    };
    //#endregion
  }
  //#endregion
}
