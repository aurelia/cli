import {PageObject_Welcome} from './welcome.po';
import {PageObject_Skeleton} from './skeleton.po';
import {browser, element, by, By, $, $$, ExpectedConditions} from 'aurelia-protractor-plugin/protractor';
import {config} from '../protractor.conf';

describe('aurelia skeleton app', function() {
  let poWelcome: PageObject_Welcome;
  let poSkeleton: PageObject_Skeleton;

  beforeEach(async () => {
    poSkeleton = new PageObject_Skeleton();
    poWelcome = new PageObject_Welcome();

    await browser.loadAndWaitForAureliaPage(`http://localhost:${config.port}`);
  });

  it('should load the page and display the initial page title', async () => {
    await expect(await poSkeleton.getCurrentPageTitle()).toBe('Aurelia Navigation Skeleton');
  });

  it('should display greeting', async () => {
    await expect(await poWelcome.getGreeting()).toBe('Hello World!');
  });
});
