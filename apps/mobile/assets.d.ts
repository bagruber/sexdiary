/**
 * Metro loest Schrift- und Bilddateien zu einem Modul auf; TypeScript
 * weiss davon nichts. Ohne diese Deklaration bliebe nur require(), und
 * das verbietet der Lint zu Recht.
 */
declare module "*.ttf" {
  const asset: number;
  export default asset;
}
