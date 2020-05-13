import * as fs from 'fs';

export class FileSystem {

  public static findSubPath(path: string, filter: (path: string) => boolean): string | undefined {
    const found = fs.readdirSync(path).find(filter);

    if (found === undefined) {
      return undefined;
    }

    return `${path}/${found}`;
  }

  public static chmod(file: string, mode: string = '0755') {
    fs.chmodSync(file, mode);
  }
}
