# @taon-dev/session

Handle jwt/cookie/header inside taon app

# How to protecte controllers methods with session middleware ?
```ts
import { TaonSessionRepository } from '@taon-dev/session/src';

@TaonController({...})
export class TaonControllerClass extends TaonBaseController {
  
  // apply middleware in proper order
  @GET({
    middlewares: ({ parentMiddlewares }) => ({
      TaonSessionMiddleware, // make sure your authentiacation middleware
      ...parentMiddlewares,  // is first
    }),
  })
  me(): Taon.Response<string> {  
    //#region @websqlFunc
    /* 
    
    me() method is protected (only logged in people can access it)
    
    */
    return async (req, res) => {
      const userId = (req as any)!.userId;
      return `Userid: ${userId}`;
    };
    //#endregion
  }
  //#endregion
  
}
```


# How to protecte controllers methods without session midldeware ?

Use beforeEachRequest controller method hook.

```ts
import { TaonSessionRepository } from '@taon-dev/session/src';

@TaonController({...})        // has paginationQuery method inherited
export class TaonControllerClass extends TaonBaseCrudController {

  // inject seesion repository
  private readonly taonSessionRepository = this.injectCustomRepo(TaonSessionRepository);

  // override hook method that is called before each controller request method 
  async beforeEachRequest({
    req,
    res,
    methodConfig,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonSessionUserController>): Promise<void> {
    if (methodConfig.methodName === 'paginationQuery') {
      await this.taonSessionRepository.throwIfNotAuthenticated({
        req,
        res
      });
    }
  }
  
}
```
