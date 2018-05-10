import {PageObjectWelcome} from './welcome.po';
import {PageObjectSkeleton} from './skeleton.po';
import {browser, element, by, By, $, $$, ExpectedConditions} from 'aurelia-protractor-plugin/protractor';
import {config} from '../protractor.conf';

describe('aurelia skeleton app', function() {
  let poWelcome: PageObjectWelcome;
  let poSkeleton: PageObjectSkeleton;

  beforeEach(async () => {
    poSkeleton = new PageObjectSkeleton();
    poWelcome = new PageObjectWelcome();

    await browser.loadAndWaitForAureliaPage(`http://localhost:${config.port}`);
  });

  it('should load the page and display the initial page title', async () => {
    await expect(await poSkeleton.getCurrentPageTitle()).toContain('Aurelia');
  });

  it('should display greeting', async () => {
    await expect(await poWelcome.getGreeting()).toBe('Hello World!');
  });
});
