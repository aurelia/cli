import {autoinject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@autoinject
export class Users {
  public heading: string = 'Github Users';
  public users: any[] = [];

  constructor(private http: HttpClient) {
    http.configure(config => {
      config
        .useStandardConfiguration()
        .withBaseUrl('https://api.github.com/');
    });
  }

  async activate(): Promise<void> {
    const response = await this.http.fetch('users');
    this.users = await response.json();
  }
}
