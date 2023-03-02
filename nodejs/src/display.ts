import { PythonShell } from 'python-shell';
import * as path from "path";
import { Address } from "symbol-sdk";

export class Display {
  private _status: boolean = false;
  private readonly _currentDirectory: string = process.cwd();
  private readonly _parentDirectory: string = path.resolve(this._currentDirectory, "..");
  private readonly _scriptPath: string = this._parentDirectory+'/python';
  private readonly _pythonPath: string = process.env.PYTHON_PATH ?? '/usr/bin/python3';

  public constructor() {}

  public call = (message: string, link: string):void => {
    this._status = true;
    let options = {
      pythonPath: this._pythonPath,
      pythonOptions: ['-u'], 
      scriptPath: this._scriptPath,
      args: [message, link]
    };
    PythonShell.run('main.py', options, ((err,data) => {
      if (err) throw err;
      console.log('finished');
      this._status = false;
    }).bind(this));
  }

  get status(): boolean {
    return this._status;
  }

}