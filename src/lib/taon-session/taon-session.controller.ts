//#region imports
import { Translation } from '@taon-dev/i18n/src';
import {
  TaonAuthContextEntity,
  TaonAuthContextRepository,
} from '@taon-dev/session/src';
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
  HttpStatusEnum,
  getStatusCode,
  getStatusText,
} from 'taon/src';
import { HttpStatusCodeMap } from 'taon/src';
import { FindOneOptions, FindOptionsWhere } from 'taon-typeorm/src';
import { _, UtilsJwt } from 'tnp-core/src';

import {
  TaonSessionIdentityProvider,
  TaonSessionUserEntity,
} from '../taon-session-user';
import { TaonSessionUserIdentityEntity } from '../taon-session-user/taon-session-user-identity.entity';
import { TaonSessionUserIdentityRepository } from '../taon-session-user/taon-session-user-identity.repository';
import { TaonSessionUserRepository } from '../taon-session-user/taon-session-user.repository';

import { TaonSessionEntity } from './taon-session.entity';
import { TaonSessionKvRepository } from './taon-session.kv.repository';
import { TaonSessionMiddleware } from './taon-session.middleware';
import { TaonLoginData } from './taon-session.models';
import { TaonSessionProvider } from './taon-session.provider';
import { TaonSessionRepository } from './taon-session.repository';
import { TaonSessionUtils } from './taon-session.utils';

//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@TaonController<TaonSessionController>({
  className: 'TaonSessionController',
  allowedMethods: [
    //#region allowed method
    'createUser',
    'userExists',
    'getCurrentUserId',
    'login',
    'logout',
    'refresh',
    'context',
    'emptyContext',
    'connectIdentity',
    'disconnectIdentity',
    'usernameAvailable',
    'changeUsername',
    //#endregion
  ],
})
export class TaonSessionController extends TaonBaseController {
  //#region fields & getters
  private readonly taonSessionKvRepository = this.injectKvRepository(
    TaonSessionKvRepository,
  );

  private readonly taonSessionUserIdentityRepository = this.injectCustomRepo(
    TaonSessionUserIdentityRepository,
  );

  private readonly taonSessionProvider =
    this.injectProvider(TaonSessionProvider);

  private readonly taonSessionUserRepository = this.injectCustomRepo(
    TaonSessionUserRepository,
  );

  private readonly taonAuthContextRepository = this.injectCustomRepo(
    TaonAuthContextRepository,
  );

  private readonly taonSessionRepository = this.injectCustomRepo(
    TaonSessionRepository,
  );
  //#endregion

  //#region createUser
  @POST()
  createUser(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Taon.Response<TaonSessionUserEntity | null> {
    //#region @websqlFunc
    return async (req, res) => {
      if (this.taonSessionProvider.login.diableLoginByEmail) {
        Taon.error({
          message: t.gettext('Login by email is disalbed'),
          status: getStatusCode(HttpStatusEnum.UNAUTHORIZED),
        });
        return null;
      }
      return this.taonSessionUserIdentityRepository.registerPasswordUser(
        email,
        password,
      );
    };
    //#endregion
  }
  //#endregion

  //#region userExists
  @POST()
  userExists(@Body('email') email: string): Taon.Response<boolean> {
    //#region @websqlFunc
    return async (req, res) => {
      if (this.taonSessionProvider.login.diableLoginByEmail) {
        Taon.error({
          message: t.gettext('Login by email is disalbed'),
          status: getStatusCode(HttpStatusEnum.UNAUTHORIZED),
        });
        return true;
      }
      const identity =
        await this.taonSessionUserIdentityRepository.findPasswordIdentity(
          email,
        );

      return (
        !!identity ||
        (this.taonSessionProvider.linkSocialAccountEmail === true &&
          (await this.taonSessionUserIdentityRepository.findUserIdByEmail(
            email,
          )) !== undefined)
      );
    };
    //#endregion
  }
  //#endregion

  //#region get google identity
  private async getGoogleIdentity(data: TaonLoginData): Promise<{
    identity?: TaonSessionUserIdentityEntity | null | undefined;
    error: boolean;
    googleData?: Awaited<
      ReturnType<typeof TaonSessionUtils.verifyGoogleAuthorizationCode>
    >;
  }> {
    //#region @backendFunc
    const { googleCode } = data;

    let googleData: Awaited<
      ReturnType<typeof TaonSessionUtils.verifyGoogleAuthorizationCode>
    >;

    try {
      googleData = await TaonSessionUtils.verifyGoogleAuthorizationCode(
        this.taonSessionProvider.socialLogin.google.googleClientId!,
        this.taonSessionProvider.socialLogin.google.googleSecret!,
        googleCode!,
      );
    } catch (error) {
      Taon.error({
        status: getStatusCode(HttpStatusEnum.INVALID_CREDENTIALS),
        message: getStatusText(HttpStatusEnum.INVALID_CREDENTIALS),
      });
      return { error: true };
    }

    if (
      !googleData?.sub ||
      !googleData?.email ||
      googleData?.emailVerified !== true
    ) {
      Taon.error({
        status: getStatusCode(HttpStatusEnum.INVALID_CREDENTIALS),
        message: 'Invalid Google authentication.',
      });
      return { error: true };
    }

    let identity =
      await this.taonSessionUserIdentityRepository.findSocialIdentity(
        TaonSessionIdentityProvider.GOOGLE,
        googleData.sub,
      );

    return { identity, error: false, googleData };
    //#endregion
  }
  //#endregion

  //#region connect identity
  @POST({
    middlewares: ({ parentMiddlewares }) => ({
      TaonSessionMiddleware,
      ...parentMiddlewares,
    }),
  })
  connectIdentity(@Body() data: TaonLoginData): Taon.Response<boolean> {
    //#region @websqlFunc
    return async (req, res) => {
      const userId = Number((req as any)!.userId);
      const provider = data.googleCode
        ? TaonSessionIdentityProvider.GOOGLE
        : data.email && data.password
          ? TaonSessionIdentityProvider.PASSWORD
          : void 0;

      switch (provider) {
        case TaonSessionIdentityProvider.PASSWORD: {
          if (this.taonSessionProvider.login.diableLoginByEmail) {
            Taon.error({
              context: 'connectIdentity diableLoginByEmail',
              status: getStatusCode(HttpStatusEnum.UNAUTHORIZED),
              message: t.gettext('Login by email is disabled.'),
            });
          }
          if (
            typeof data.password !== 'string' ||
            data.password.length < 8 ||
            data.password.length > 128
          ) {
            Taon.error({
              context: 'connectIdentity data.password',
              status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
              message: t.gettext(
                'Password must contain between 8 and 128 characters.',
              ),
            });
          }
          await this.taonSessionUserIdentityRepository.connectPasswordIdentity(
            userId,
            data.email!,
            data.password!,
          );
          return true;
        }

        case TaonSessionIdentityProvider.GOOGLE: {
          const { identity, error, googleData } = await this.getGoogleIdentity({
            googleCode: data.googleCode,
          });

          if (error) {
            return false;
          }

          if (identity) {
            if (identity.userId === userId) {
              // Already connected to this user.
              return true;
            }

            Taon.error({
              status: getStatusCode(HttpStatusEnum.CONFLICT),
              message: t.gettext(
                'This Google account is already connected to another user.',
              ),
            });

            return false;
          }

          await this.taonSessionUserIdentityRepository.createSocialIdentity(
            userId,
            TaonSessionIdentityProvider.GOOGLE,
            googleData!.sub,
            googleData!.email,
            googleData!.emailVerified,
          );

          return true;
        }

        default: {
          Taon.error({
            status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
            message: t.gettext('Unsupported identity provider.'),
          });

          return false;
        }
      }
    };
    //#endregion
  }
  //#endregion

  //#region username available
  @POST({
    middlewares: ({ parentMiddlewares }) => ({
      TaonSessionMiddleware,
      ...parentMiddlewares,
    }),
  })
  usernameAvailable(
    @Body('username') username: string,
  ): Taon.Response<boolean> {
    //#region @websqlFunc
    return async req =>
      this.taonSessionUserRepository.isUsernameAvailable(
        username,
        Number('userId' in req ? req.userId : undefined),
      );
    //#endregion
  }
  //#endregion

  //#region change username
  @POST({
    middlewares: ({ parentMiddlewares }) => ({
      TaonSessionMiddleware,
      ...parentMiddlewares,
    }),
  })
  changeUsername(@Body('username') username: string): Taon.Response<boolean> {
    //#region @websqlFunc
    return async req => {
      await this.taonSessionUserRepository.changeUsername(
        Number('userId' in req ? req.userId : undefined),
        username,
      );
      return true;
    };
    //#endregion
  }
  //#endregion

  //#region disconnect identity
  @POST({
    middlewares: ({ parentMiddlewares }) => ({
      TaonSessionMiddleware,
      ...parentMiddlewares,
    }),
  })
  disconnectIdentity(
    @Body('provider') provider: TaonSessionIdentityProvider,
  ): Taon.Response<boolean> {
    //#region @websqlFunc
    return async (req, res) => {
      const userId = Number((req as any)!.userId);

      const identity = await this.taonSessionUserIdentityRepository.findOne({
        where: {
          userId,
          provider,
        },
      });

      if (!identity) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.NOT_FOUND),
          message: t.gettext('Identity not found.'),
        });

        return false;
      }

      const identities = await this.taonSessionUserIdentityRepository.find({
        where: {
          userId,
        },
      });

      if (identities.length <= 1) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
          message: t.gettext('You cannot disconnect your only sign-in method.'),
        });

        return false;
      }

      await this.taonSessionUserIdentityRepository.remove(identity);

      return true;
    };
    //#endregion
  }
  //#endregion

  //#region login
  @POST()
  login(@Body() data: TaonLoginData): Taon.Response<boolean> {
    //#region @websqlFunc
    return async (req, res) => {
      let { email, password, googleCode } = data || {};

      const isSocialLogin = !!googleCode;

      let user: TaonSessionUserEntity | null = null;
      let loginIdentity: TaonSessionUserIdentityEntity;

      if (isSocialLogin) {
        //#region google login

        let { identity, error, googleData } =
          await this.getGoogleIdentity(data);

        if (error) {
          return false;
        }

        if (!identity) {
          identity =
            await this.taonSessionUserIdentityRepository.resolveSocialIdentity(
              TaonSessionIdentityProvider.GOOGLE,
              googleData!.sub,
              googleData!.email,
              googleData!.emailVerified,
            );
        }
        loginIdentity = identity;
        user = await this.taonSessionUserRepository.findOne({
          where: { id: identity.userId },
        });
        //#endregion
      } else {
        //#region password login

        if (this.taonSessionProvider.login.diableLoginByEmail) {
          Taon.error({
            status: getStatusCode(HttpStatusEnum.UNAUTHORIZED),
            message: t.gettext('Login by email is disabled.'),
          });
        }

        if (!email || !password) {
          Taon.error({
            status: getStatusCode(HttpStatusEnum.INVALID_CREDENTIALS),
            message: getStatusText(HttpStatusEnum.INVALID_CREDENTIALS),
          });

          return false;
        }

        const identity =
          await this.taonSessionUserIdentityRepository.verifyPassword(
            email,
            password,
          );

        if (!identity) {
          Taon.error({
            status: getStatusCode(HttpStatusEnum.INVALID_CREDENTIALS),
            message: getStatusText(HttpStatusEnum.INVALID_CREDENTIALS),
          });

          return false;
        }

        user = await this.taonSessionUserRepository.findOne({
          where: {
            id: identity.userId,
          },
        });
        loginIdentity = identity;

        //#endregion
      }

      //#region validate user

      if (!user || !user.isActive) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.INVALID_CREDENTIALS),
          message: t.gettext(`User is not active`),
        });

        return false;
      }

      //#endregion

      // await (async () => {
      //   const session = new TaonSessionEntity();

      //   session.userId = 1;
      //   session.lastActivityAt = new Date();
      //   session.expiresAt = new Date(Date.now() + 60_000);

      //   console.log('BEFORE', {
      //     lastActivityAt: session.lastActivityAt,
      //     expiresAt: session.expiresAt,
      //   });

      //   const saved = await this.taonSessionRepository.save(session);

      //   console.log('AFTER', {
      //     lastActivityAt: saved.lastActivityAt,
      //     expiresAt: saved.expiresAt,
      //   });
      // })();

      //#region create session

      const sessionObjToSave = new TaonSessionEntity().clone({
        userId: user.id,
        identityId: loginIdentity.id,
        authenticationProvider: loginIdentity.provider,
        ...TaonSessionUtils.getRequestMetadata(req),
        lastActivityAt: new Date(),
        expiresAt: new Date(
          Date.now() +
            this.taonSessionProvider.cookies.REFRESH_TOKEN_EXPIRES_SECONDS *
              1000,
        ),
      });

      const session =
        await this.taonSessionRepository.createSession(sessionObjToSave);

      // const loaded = await this.taonSessionRepository.findOne({
      //   where: { id: session.id },
      // });

      // console.log('RELOADED SESSION', loaded);

      //#endregion

      //#region create auth tokens

      const accessToken = await this.taonSessionKvRepository.createAccessToken(
        user.id,
        session.id,
      );

      const refreshToken =
        await this.taonSessionKvRepository.createRefreshToken(
          user.id,
          session.id,
        );

      this.taonSessionKvRepository.setAuthCookies(
        res!,
        accessToken,
        refreshToken,
      );

      //#endregion

      return true;
    };
    //#endregion
  }
  //#endregion

  //#region refresh
  @POST()
  refresh(): Taon.Response<boolean> {
    //#region @websqlFunc
    return async (req, res) => {
      const token = req!.cookies?.refreshToken;

      if (!token) {
        Taon.error({
          status: 401,
          context: 'refresh',
          message: 'No refresh token',
        });
        return false;
      }

      let payload: UtilsJwt.JwtPayload;
      try {
        payload = await UtilsJwt.verify(
          token,
          this.taonSessionProvider.cookies.REFRESH_TOKEN_SECRET,
        );
      } catch {
        Taon.error({
          status: 401,
          context: 'refresh verification',
          message: 'Invalid refresh token',
        });
        return false;
      }
      if (typeof payload.rtId !== 'string' || !payload.rtId) {
        Taon.error({
          status: 401,
          context: 'refresh rotation',
          message: 'Invalid refresh token',
        });
        return false;
      }

      const session = await this.taonSessionKvRepository.get(payload.rtId);

      if (!session) {
        Taon.error({
          status: 401,
          message: 'Invalid refresh token',
        });
        return false;
      }

      if (session.expiresAt <= Date.now()) {
        await this.taonSessionKvRepository.delete(payload.rtId);
        Taon.error({
          status: 401,
          message: 'Expired refresh token',
        });
        return false;
      }

      if (session.sessionId !== undefined) {
        await this.taonSessionRepository.touchSession(
          session.sessionId,
          session.userId,
          true,
        );
      }

      // ROTATION (important)
      await this.taonSessionKvRepository.delete(payload.rtId);

      const newAccessToken =
        await this.taonSessionKvRepository.createAccessToken(
          session.userId,
          session.sessionId,
        );

      const newRefreshToken =
        await this.taonSessionKvRepository.createRefreshToken(
          session.userId,
          session.sessionId,
        );

      this.taonSessionKvRepository.setAuthCookies(
        res!,
        newAccessToken,
        newRefreshToken,
      );

      return true;
    };
    //#endregion
  }
  //#endregion

  //#region logout
  @POST()
  logout(): Taon.Response<boolean> {
    //#region @websqlFunc
    return async (req, res) => {
      const refreshToken = req!.cookies?.refreshToken;
      const token =
        refreshToken || this.taonSessionKvRepository.getTokenFromRequest(req);

      if (token) {
        let payload: UtilsJwt.JwtPayload;
        try {
          payload = await UtilsJwt.verify(
            token,
            refreshToken
              ? this.taonSessionProvider.cookies.REFRESH_TOKEN_SECRET
              : this.taonSessionProvider.cookies.ACCESS_TOKEN_SECRET,
          );
        } catch (error) {
          console.error(error);
          this.taonSessionKvRepository.clearAuthCookies(res!);
          Taon.error({
            status: 401,
            context: 'logout',
            message: getStatusText(HttpStatusEnum.INVALID_TOKEN),
          });
          return false;
        }
        if (refreshToken) {
          if (typeof payload.rtId !== 'string' || !payload.rtId) {
            Taon.error({
              status: 401,
              context: 'logout',
              message: 'Invalid refresh token',
            });
            return false;
          }
          const session = await this.taonSessionKvRepository.get(payload.rtId);
          if (session?.sessionId !== undefined) {
            await this.taonSessionRepository.revokeSession(
              session.sessionId,
              session.userId,
            );
          }
          await this.taonSessionKvRepository.delete(payload.rtId);
        } else if (
          typeof payload.sessionId === 'number' &&
          typeof payload.userId === 'number'
        ) {
          await this.taonSessionRepository.revokeSession(
            payload.sessionId,
            payload.userId,
          );
        }
      }

      this.taonSessionKvRepository.clearAuthCookies(res!);
      return true;
    };
    //#endregion
  }
  //#endregion

  //#region context
  @GET({
    middlewares: ({ parentMiddlewares }) => ({
      TaonSessionMiddleware,
      ...parentMiddlewares,
    }),
  })
  context(): Taon.Response<TaonAuthContextEntity> {
    //#region @websqlFunc
    return async (req, res) => {
      const userId = (req as any)!.userId;
      const context = await this.taonAuthContextRepository.getContext(userId);
      return context;
    };
    //#endregion
  }
  //#endregion

  //#region empty context
  @GET()
  emptyContext(): Taon.Response<TaonAuthContextEntity> {
    //#region @websqlFunc
    return async (req, res) => {
      const context = await this.taonAuthContextRepository.getContext();
      return context;
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
    //#region @websqlFunc
    return async (req, res) => {
      const userId = (req as any)!.userId;
      return Number(userId);
    };
    //#endregion
  }
  //#endregion
}
