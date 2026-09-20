//#region imports
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
import { FindOneOptions, FindOptionsWhere } from 'taon-typeorm/src';
import { _, UtilsJwt } from 'tnp-core/src';

import { TaonSessionUserEntity } from '../taon-session-user';
import { TaonSessionUserRepository } from '../taon-session-user/taon-session-user.repository';

import { TaonSessionKvRepository } from './taon-session.kv.repository';
import { TaonSessionMiddleware } from './taon-session.middleware';
import { TaonLoginData } from './taon-session.models';
import { TaonSessionProvider } from './taon-session.provider';
import { TaonSessionUtils } from './taon-session.utils';

const tempPassForSocialLogin = 'tempPassForSocialLogin';
//#endregion

@TaonController<TaonSessionController>({
  className: 'TaonSessionController',
  allowedMethods: [
    'createUser',
    'userExists',
    'getCurrentUserId',
    'login',
    'logout',
    'refresh',
    'me',
    'helloWorld',
  ],
})
export class TaonSessionController extends TaonBaseController {
  taonSessionKvRepository = this.injectKvRepository(TaonSessionKvRepository);

  taonSessionProvider = this.injectProvider(TaonSessionProvider);

  taonSessionUserRepository = this.injectCustomRepo(TaonSessionUserRepository);

  //#region createUser
  @POST()
  createUser(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Taon.Response<TaonSessionUserEntity | null> {
    //#region @backendFunc
    return async (req, res) => {
      const exitedUser = await this.taonSessionUserRepository.findOne({
        where: {
          email,
        },
      });
      if (exitedUser) {
        return null;
      }

      let user = new TaonSessionUserEntity().clone({ email, password });
      user = await this.taonSessionUserRepository.save(user);
      delete user.password;
      return user;
    };
    //#endregion
  }
  //#endregion

  //#region userExists
  @POST()
  userExists(@Body('email') email: string): Taon.Response<boolean> {
    //#region @backendFunc
    return async (req, res) => {
      const exitedUser = await this.taonSessionUserRepository.findOne({
        where: {
          email,
        },
      });
      return !!exitedUser;
    };
    //#endregion
  }
  //#endregion

  //#region login
  @POST()
  login(@Body() data: TaonLoginData): Taon.Response<boolean> {
    //#region @backendFunc
    return async (req, res) => {
      let { email, password, googleCode } = data || {};
      const isSocialLogin = !!googleCode;

      if (isSocialLogin) {
        //#region handle social login
        let googleData: Awaited<
          ReturnType<typeof TaonSessionUtils.verifyGoogleAuthorizationCode>
        >;
        try {
          googleData = await TaonSessionUtils.verifyGoogleAuthorizationCode(
            this.taonSessionProvider.socialLogin.google.googleClientId,
            this.taonSessionProvider.socialLogin.google.googleSecret,
            googleCode,
          );
          console.log('SUCCESSFULLY DONE USING NEW API')
        } catch (error) {}

        if (googleData?.emailVerified) {
          email = googleData.email;
        } else {
          Taon.error({
            status: 500,
            message: 'Invalid code or something went wrong with social login.',
          });
          return false;
        }
        //#endregion
      }

      const searchPayload: FindOptionsWhere<TaonSessionUserEntity> = {
        email,
      };
      if (!isSocialLogin) {
        searchPayload.password = password;
      }

      let user = await this.taonSessionUserRepository.findOne({
        where: searchPayload,
      });

      if (!user && isSocialLogin) {
        user = new TaonSessionUserEntity().clone({
          email,
          password: tempPassForSocialLogin,
        });
        user = await this.taonSessionUserRepository.save(user);
      }

      if (!user) {
        Taon.error({
          status: 401,
          message: 'Invalid credentials',
        });
        return false;
      }

      const accessToken = await this.taonSessionKvRepository.createAccessToken(
        user.id,
      );
      const refreshToken =
        await this.taonSessionKvRepository.createRefreshToken(user.id);

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
        const payload = (await UtilsJwt.verify(
          token,
          this.taonSessionProvider.cookies.REFRESH_TOKEN_SECRET,
        )) as any;

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

        const newAccessToken =
          await this.taonSessionKvRepository.createAccessToken(session.userId);

        const newRefreshToken =
          await this.taonSessionKvRepository.createRefreshToken(session.userId);

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
          const payload = (await UtilsJwt.verify(
            token,
            this.taonSessionProvider.cookies.REFRESH_TOKEN_SECRET,
          )) as any;
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
      return `Userid: ${userId}`;
    };
    //#endregion
  }
  //#endregion

  //#region get current user id
  @GET({
    middlewares: ({ parentMiddlewares }) => ({
      TaonSessionMiddleware,
      ...parentMiddlewares,
    }),
  })
  getCurrentUserId(): Taon.Response<number> {
    //#region @backendFunc
    return async (req, res) => {
      const userId = (req as any)!.userId;
      return Number(userId);
    };
    //#endregion
  }
  //#endregion

  //#region hello world
  @GET()
  helloWorld(): Taon.Response<string> {
    return async () => 'hello world from TaonSessionController';
  }

  @GET()
  helloWorldJson(): Taon.Response<any> {
    return async () => {
      helo: 'world';
    };
  }
  //#endregion
}
