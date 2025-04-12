import { moduleIdWithPlugin } from './utils';

export class LoaderPlugin {
  public readonly type: string;
  private readonly config: AureliaJson.ILoaderPlugin;
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
  #test: RegExp;

  constructor(type: string, config:  AureliaJson.ILoaderPlugin) {
    this.type = type;
    this.config = config;
    this.#test = config.test ? new RegExp(config.test) : regExpFromExtensions(config.extensions);
  }

  matches(filePath: string) {
    return this.#test.test(filePath);
  }

  transform(moduleId: string, filePath: string, contents: any) {
    contents = `define('${this.createModuleId(moduleId)}',[],function(){return ${JSON.stringify(contents)};});`;
    return contents;
  }

  createModuleId(moduleId: string) {
    // for backward compatibility, use 'text' as plugin name,
    // to not break existing app with additional json plugin in aurelia.json
    return moduleIdWithPlugin(moduleId, 'text', this.type);
  }
};

function regExpFromExtensions(extensions: string[]) {
  return new RegExp('^.*(' + extensions.map(x => '\\' + x).join('|') + ')$');
}

