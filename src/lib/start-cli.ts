//#region imports
import { Taon } from 'taon/src';
import { UtilsJson, UtilsOs, UtilsTerminal } from 'tnp-core/src';
import { Helpers, BaseCommandLineFeature } from 'tnp-helpers/src';
import { BaseProject, BaseStartConfig } from 'tnp-helpers/src'; // @backend

import { TaonSessionContext, TaonSessionController } from './taon-session';

import { DEFAULT_SESSION_EMAIL, DEFAULT_SESSION_PASSWORD } from './index';

//#endregion

//#region create taon context
const host = `http://localhost:${Number(
  Helpers.readFile('.taon/libs-apps-ports/HOST_BACKEND_PORT_1'),
)}`;
// console.log({ overrideRemoteHost });

const TaonSessionActiveCtx = !UtilsOs.isRunningInCliMode()
  ? ({} as ReturnType<typeof Taon.createContext>)
  : TaonSessionContext.cloneAsRemote({
      overrideRemoteHost: host,
      overrideContextName: 'SessionContext'
    });
//#endregion

//#region CLI / global scope
/**
 * This class is for handling global arguments. *
 * Cli engine will parse: hello:world:from:global:arg to helloWorldFromGlobalArg
 * (lower case, camel case) .. so you don't need to worry about misspelling
 * arguments
 */
class $Global extends BaseCommandLineFeature<{}> {
  //#region initialize (before each method)
  protected async __initialize__() {
    //#region @backendFunc
    Helpers.taskStarted(`initilizing context for cli`);
    await TaonSessionActiveCtx.initialize();
    //#endregion
    await super.__initialize__();
  }
  //#endregion

  //#region _
  /**
   * When you execute cli without arguments:`$ cli`
   */
  public _() {
    console.log(`Hello world from cli`);
    this._exit();
  }
  //#endregion

  //#region menu
  async menu() {
    //#region @backendFunc

    while (true) {
      UtilsTerminal.clearConsole();
      //#region assign stuff
      let isLoggedIn = false;

      let userId = void 0 as number;

      const taonSessionController = await TaonSessionActiveCtx.getClassInstance(
        TaonSessionController,
      );
      //#endregion

      //#region initial check
      try {
        const data = await taonSessionController.getCurrentUserId().request!();
        userId = data.body.numericValue;
        isLoggedIn = true;
      } catch (error) {
        userId = undefined;
        isLoggedIn = false;
      }

      Helpers.info(`

        Login Status: ${isLoggedIn}
        User id: ${userId}

        `);
      //#endregion

      //#region display menu
      const choices = {
        refresh: {
          name: 'Refresh Status',
        },
        login: {
          name: 'Login',
        },
        logout: {
          name: 'Logout',
        },

        exit: {
          name: 'Exit',
        },
      };

      const res = await UtilsTerminal.select<keyof typeof choices>({
        choices,
        question: `Select action`,
      });
      //#endregion

      if (res === 'login') {
        //#region login

        const email = await UtilsTerminal.input({
          question: 'Enter email',
          defaultValue: DEFAULT_SESSION_EMAIL,
        });

        const password = await UtilsTerminal.input({
          question: 'Enter password',
          defaultValue: DEFAULT_SESSION_PASSWORD,
        });

        try {
          await taonSessionController.login({
            email,
            password,
          }).request!();
          Helpers.info(`Loggin successs`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key',
          });
        } catch (error) {
          Helpers.error(`Loggin error`, true, false);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to try again',
          });
        }
        //#endregion
        continue;
      }
      if (res === 'logout') {
        //#region logout
        try {
          await taonSessionController.logout().request!();
          Helpers.info(`Logout done`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key',
          });
        } catch (error) {
          Helpers.error(`Logout error`, true, false);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to try again',
          });
        }
        //#endregion
        continue;
      }
      if (res === 'refresh') {
        continue;
      }
      if (res === 'exit') {
        this._exit(0);
      }
    }

    //#endregion
  }
  //#endregion

  //#region ping
  /**
   * When you execute: `$ cli hello:world:from:global:arg`
   * (or `$ cli helloWorldFromGlobalArg`)
   */
  async ping() {
    const taonSessionController = await TaonSessionActiveCtx.getClassInstance(
      TaonSessionController,
    );

    try {
      const data = await taonSessionController.helloWorld().request!();
      console.log(data.body.text);
    } catch (error) {
      console.error(error);
    }

    this._exit();
  }
  //#endregion
}
//#endregion

//#region CLI / Version Scope
/**
 *
 */
class $Version extends BaseCommandLineFeature<{
  anyCLIparamsHere: string;
}> {
  /**
   * When you execute: `$ cli version`
   */
  public _() {
    console.log(`Hello world from version argument`);
    this._exit();
  }

  /**
   * When you execute: `$ cli version:getFromPackageJson`
   */
  public getFromPackageJson() {
    const ver = UtilsJson.getValue(
      this.project.pathFor('package.json'),
      'version',
      {
        defaultValue: '<not defined>',
      },
    );
    console.log(`Version from packageJson ${ver}`);
    this._exit(0);
  }
}
//#endregion

//#region start cli
/**
 *
 * @param argsv process.argsv
 * @param filename needed if you want ipc communicaiton
 */
export async function startCli(
  argsv: string[],
  filename: string,
): Promise<void> {
  //#region @backendFunc

  new BaseStartConfig({
    ProjectClass: BaseProject,
    functionsOrClasses: [
      {
        classOrFnName: '', // registerd as global (only 1 class can be like this)
        funcOrClass: $Global,
      },
      {
        classOrFnName: '$Version',
        funcOrClass: $Version,
      },
    ],
    argsv,
    useStringArrForArgsFunctions: true,
    shortArgsReplaceConfig: {
      v: 'version',
    },
    callbackNotRecognizedCommand: async () => {
      Helpers.error(`Command not recognized`, false, true);
    },
  });
  //#endregion
}
//#endregion

export default startCli;
