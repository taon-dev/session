export namespace TaonSessionUserUtils {
  export function generateRandomUsername(): string {
    return `user${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
}
