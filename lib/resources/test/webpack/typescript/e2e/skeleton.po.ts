import {browser, element, by, By, $, $$, ExpectedConditions} from 'aurelia-protractor-plugin/protractor';

export class PageObject_Skeleton {
  getCurrentPageTitle() {
    return browser.getTitle();
  }
}
