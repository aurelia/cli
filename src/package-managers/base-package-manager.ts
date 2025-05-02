import { spawn, type ChildProcess } from 'node:child_process';
import npmWhich from 'npm-which';
const isWindows = process.platform === 'win32';

export abstract class BasePackageManager {
  private executableName: string;
  private proc: ChildProcess | undefined;
  
  constructor(executableName: string) {
    this.executableName = executableName;
  }

  install(packages: string[] = [], workingDirectory: string = process.cwd(), command: string = 'install') {
    return this.run(command, packages, workingDirectory);
  }

  run(command: string, args: string[] = [], workingDirectory: string = process.cwd()): Promise<void> {
    let executable = this.getExecutablePath(workingDirectory);
    if (isWindows) {
      executable = JSON.stringify(executable); // Add quotes around path
    }

    return new Promise<void>((resolve, reject) => {
      this.proc = spawn(
        executable,
        [command, ...args],
        { stdio: 'inherit', cwd: workingDirectory, shell: isWindows }
      )
        .on('close', resolve)
        .on('error', reject);
    });
  }

  getExecutablePath(directory: string): string | null {
    try {
      return npmWhich(directory).sync(this.executableName) as string;
    } catch {
      return null;
    }
  }

  isAvailable(directory: string): boolean {
    return !!this.getExecutablePath(directory);
  }
};
