import {browser, element, by, By, $, $$, ExpectedConditions} from 'aurelia-protractor-plugin/protractor';

export class PageObjectWelcome {
  getGreeting() {
    return element(by.tagName('h1')).getText();
  }
}
