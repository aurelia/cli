export class PageObjectWelcome {
  getGreeting() {
    return element(by.tagName('h1')).getText();
  }
}
