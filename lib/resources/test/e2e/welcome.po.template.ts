import {browser, element, by, By, $, $$, ExpectedConditions} from 'aurelia-protractor-plugin/protractor';

export class PageObjectWelcome {
// @if features.navigation!='navigation'
  getGreeting() {
    return element(by.tagName('h1')).getText();
  }
// @endif

// @if features.navigation='navigation'
  getGreeting() {
    return element(by.tagName('h2')).getText();
  }

  setFirstname(value) {
    let firstName = element(by.valueBind('firstName'));
    return firstName.clear().then(() => firstName.sendKeys(value));
  }

  setLastname(value) {
    let lastName = element(by.valueBind('lastName'));
    return lastName.clear().then(() => lastName.sendKeys(value));
  }

  getFullnameElement() {
    return element(by.css('.help-block'));
  }

  getFullname() {
    return this.getFullnameElement().getText();
  }

  pressSubmitButton() {
    return element(by.css('button[type="submit"]')).click();
  }

  async openAlertDialog() {
    await this.pressSubmitButton();

    await browser.wait(ExpectedConditions.alertIsPresent(), 5000);

    try {
      await browser.switchTo().alert().accept();
      return true;
    } catch (e) {
      return false;
    }
  }
// @endif
}
