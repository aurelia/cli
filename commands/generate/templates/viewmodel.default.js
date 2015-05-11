{{#isInjectionUsed}}
import {{{inject}}} from 'aurelia-framework';
{{/isInjectionUsed}}

{{#isInjectionUsed}}
@inject({{inject}})
{{/isInjectionUsed}}
export class {{pageName}} {
  hello = 'Welcome to Aurelia!';

  constructor({{toCamelCase inject}}){

  }

  activate() {
    // called when the VM is activated
  }

  attached() {
    // called when View is attached, you are safe to do DOM operations here
  }
}
