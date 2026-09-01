//#region tnp-helpers cli template
import { Taon } from 'taon/src';
import { UtilsJson, UtilsOs } from 'tnp-core/src';
import { Helpers, BaseCommandLineFeature } from 'tnp-helpers/src';
import { BaseProject, BaseStartConfig } from 'tnp-helpers/src'; // @backend

import { TaonSessionContext, TaonSessionController } from './taon-session';
//#endregion

const host = `http://localhost:${Number(
  Helpers.readFile('.taon/libs-apps-ports/HOST_BACKEND_PORT_1'),
)}`;
// console.log({ overrideRemoteHost });

const TaonSessionActiveCtx = !UtilsOs.isRunningInCliMode()
  ? ({} as ReturnType<typeof Taon.createContext>)
  : Taon.createContext(() => ({
      contexts: { TaonSessionContext },
      contextName: 'SessionContext',
      host,
      // TaonSessionContext.({
      // overrideRemoteHost,
      // overrideContextName: 'SessionContext',
      // })
    }));

//#region CLI / global scope
/**
 * This class is for handling global arguments. *
 * Cli engine will parse: hello:world:from:global:arg to helloWorldFromGlobalArg
 * (lower case, camel case) .. so you don't need to worry about misspelling
 * arguments
 */
class $Global extends BaseCommandLineFeature<{}> {
  /**
   * When you execute cli without arguments:`$ cli`
   */
  public _() {
    console.log(`Hello world from cli`);
    this._exit();
  }

  /**
   * When you execute: `$ cli hello:world:from:global:arg`
   * (or `$ cli helloWorldFromGlobalArg`)
   */
  async ping() {
    Helpers.taskStarted(`initilizing context for cli`);
    await TaonSessionActiveCtx.initialize()
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

export default startCli;
