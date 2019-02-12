import {computedFrom} from 'aurelia-framework';

export class Welcome {
  public heading: string = 'Welcome to the Aurelia Navigation App!';
  public firstName: string = 'John';
  public lastName: string = 'Doe';
  private previousValue: string = this.fullName;

  // Getters can't be directly observed, so they must be dirty checked.
  // However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
  @computedFrom('firstName', 'lastName')
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public submit() {
    this.previousValue = this.fullName;
    alert(`Welcome, ${this.fullName}!`);
  }

  public canDeactivate(): boolean | undefined {
    if (this.fullName !== this.previousValue) {
      return confirm('Are you sure you want to leave?');
    }
  }
}

export class UpperValueConverter {
  public toView(value: string): string {
    return value && value.toUpperCase();
  }
}
