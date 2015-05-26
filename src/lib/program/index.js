import {Command} from './command';
import {EventEmitter} from 'events';

export class Program extends EventEmitter{

  constructor(config) {
    super();
    this.config = config;
    this.maxFlags = 0;
  }

  command(Construction, commandId) {

    var command = new Command(this, this.config);
    command.createContext(Construction, commandId);
    return command;
  }
}

