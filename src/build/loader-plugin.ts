import { moduleIdWithPlugin } from './utils';

export class LoaderPlugin {
  public readonly type: LoaderType;
  private readonly config: AureliaJson.ILoaderPlugin;
  private readonly _test: RegExp;

  public get name() {
    return this.config.name;
  }
  public get stub() {
    return this.config.stub;
  }
  public get extensions() {
    return this.config.extensions;
  }
  public get test(){
    return this.config.test;
  }

  constructor(type: LoaderType, config: AureliaJson.ILoaderPlugin) {
    this.type = type;
    this.config = config;
    this._test = config.test ? new RegExp(config.test) : regExpFromExtensions(config.extensions);
  }

  public matches(filePath: string) {
    return this._test.test(filePath);
  }

  public transform(moduleId: string, filePath: string, contents: string) {
    contents = `define('${this.createModuleId(moduleId)}',[],function(){return ${JSON.stringify(contents)};});`;
    return contents;
  }

  public createModuleId(moduleId: string) {
    // for backward compatibility, use 'text' as plugin name,
    // to not break existing app with additional json plugin in aurelia.json
    return moduleIdWithPlugin(moduleId, 'text', this.type);
  }
};

function regExpFromExtensions(extensions: string[]) {
  return new RegExp('^.*(' + extensions.map(x => '\\' + x).join('|') + ')$');
}

