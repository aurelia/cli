import {autoinject} from 'aurelia-framework';

@autoinject
export class ColorCustomAttribute {
  constructor(private element: Element) {}

  valueChanged(newValue: string, oldValue: string) {
    (<HTMLElement>this.element).style.color = newValue;
  }
}
