import * as path from 'node:path';
import * as fs from './file-system';
import * as Utils from './build/utils';

// Legacy code, kept only for supporting `au generate`
export class ProjectItem {
  public parent: ProjectItem | undefined;
  public text: string | undefined;

  /** Accessed from `aurelia_project/components.ts` */
  public readonly name: string;
  private readonly isDirectory: boolean;
  private _children: ProjectItem[] | undefined;

  constructor(name: string, isDirectory: boolean) {
    this.name = name;
    this.isDirectory = !!isDirectory;
  }

  get children() {
    if (!this._children) {
      this._children = [];
    }

    return this._children;
  }

  add(...children: ProjectItem[]) {
    if (!this.isDirectory) {
      throw new Error('You cannot add items to a non-directory.');
    }

    for (let i = 0; i < children.length; ++i) {
      const child = children[i];

      if (this.children.indexOf(child) !== -1) {
        continue;
      }

      child.parent = this;
      this.children.push(child);
    }

    return this;
  }

  calculateRelativePath(fromLocation: string | ProjectItem): string {
    if (this === fromLocation) {
      return '';
    }

    const parentRelativePath = (this.parent && this.parent !== fromLocation)
      ? this.parent.calculateRelativePath(fromLocation)
      : '';

    return path.posix.join(parentRelativePath, this.name);
  }

  async create(relativeTo: string): Promise<void> {
    const fullPath = relativeTo ? this.calculateRelativePath(relativeTo) : this.name;

    // Skip empty folder
    if (this.isDirectory && this.children.length) {
        try {
            await fs.stat(fullPath);
        } catch {
            await fs.mkdir(fullPath);
        }
        await Utils.runSequentially(this.children, child => child.create(fullPath));
        return;
    }

    if (this.text) {
        await fs.writeFile(fullPath, this.text);
    }
}


  setText(text: string) {
    this.text = text;
    return this;
  }

  getText() {
    return this.text;
  }

  static text(name: string, text: string) {
    return new ProjectItem(name, false).setText(text);
  }

  static directory(p: string) {
    return new ProjectItem(p, true);
  }
};
