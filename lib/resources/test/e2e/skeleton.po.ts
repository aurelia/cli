import {browser, element, by, By, $, $$, ExpectedConditions} from 'aurelia-protractor-plugin/protractor';

export class PageObjectSkeleton {
  getCurrentPageTitle() {
    return browser.getTitle();
  }
}
