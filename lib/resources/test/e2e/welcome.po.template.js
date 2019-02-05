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
    return element(by.valueBind('firstName')).clear().sendKeys(value);
  }

  setLastname(value) {
    return element(by.valueBind('lastName')).clear().sendKeys(value);
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
