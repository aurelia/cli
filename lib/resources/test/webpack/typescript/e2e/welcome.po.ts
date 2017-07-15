import {browser, element, by, By, $, $$, ExpectedConditions} from 'aurelia-protractor-plugin/protractor';

export class PageObject_Welcome {
  getGreeting() {
    return element(by.tagName('h1')).getText();
  }
}
