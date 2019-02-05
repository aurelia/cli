import {PageObjectWelcome} from './welcome.po';
import {PageObjectSkeleton} from './skeleton.po';
import {config} from '../protractor.conf';

describe('aurelia skeleton app', function() {
  let poWelcome;
  let poSkeleton;

  beforeEach(async () => {
    poSkeleton = new PageObjectSkeleton();
    poWelcome = new PageObjectWelcome();

    await browser.loadAndWaitForAureliaPage(`http://localhost:${config.port}`);
  });

  it('should load the page and display the initial page title', async () => {
    await expect(await poSkeleton.getCurrentPageTitle()).toContain('Aurelia');
  });

// @if features.navigation!='navigation'
  it('should display greeting', async () => {
    await expect(await poWelcome.getGreeting()).toBe('Hello World!');
  });
// @endif

// @if features.navigation='navigation'
it('should display greeting', async () => {
  await expect(await poWelcome.getGreeting()).toBe('Welcome to the Aurelia Navigation App!');
});

it('should automatically write down the fullname', async () => {
  await poWelcome.setFirstname('Jane');
  await poWelcome.setLastname('Doe');

  // binding is not synchronous,
  // therefore we should wait some time until the binding is updated
  await browser.wait(
    ExpectedConditions.textToBePresentInElement(
      poWelcome.getFullnameElement(), 'JANE DOE'
    ), 200
  );
});

it('should show alert message when clicking submit button', async () => {
  await expect(await poWelcome.openAlertDialog()).toBe(true);
});

it('should navigate to users page', async () => {
  await poSkeleton.navigateTo('#/users');
  browser.sleep(200);
  await expect(await poSkeleton.getCurrentPageTitle()).toBe('Github Users | Aurelia');
});
// @endif
});
