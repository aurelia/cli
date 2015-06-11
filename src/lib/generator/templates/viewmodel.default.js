{{#isInjectionUsed}}
import { inject } from 'aurelia-framework';
{{#each injectWithoutImport}}
import { {{this}} } from 'aurelia-framework';
{{/each}}
{{/isInjectionUsed}}

{{#isInjectionUsed}}
@inject({{#join inject ','}}{{this}}{{/join}})
{{/isInjectionUsed}}
export class {{pageName}} {
  hello = 'Welcome to Aurelia!';

  constructor({{#join inject ','}}{{toCamelCase this}}{{/join}}){

  }

  activate() {
    // called when the VM is activated
  }

  attached() {
    // called when View is attached, you are safe to do DOM operations here
  }
}
