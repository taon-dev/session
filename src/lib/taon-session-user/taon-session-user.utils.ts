export namespace TaonSessionUserUtils {
  export const randomUUID = (): string => {
    //#region @browser
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
    //#endregion

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
      const random = (Math.random() * 16) | 0;
      const value = char === 'x' ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    });
  };

  export function generateRandomUsername(): string {
    return `user${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
}
