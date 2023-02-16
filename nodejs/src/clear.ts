require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger('system');

import { PythonShell } from 'python-shell';
import * as path from "path";
const currentDirectory = process.cwd();
const parentDirectory = path.resolve(currentDirectory, "..");
const pythonPath = parentDirectory+'/python';

/**
 * ログの設定
 */
log4js.configure({
  appenders : {
    system :  {
      type : 'dateFile',
      filename : 'log/sysLog.log',
      pattern: "-yyyy-MM-dd"
    }
  },
  categories : {
    default : { appenders : ['system'], level : 'debug' },
  }
});

/** =========== */
const python_path: string = process.env.PYTHON_PATH ?? '/usr/bin/python3';
/** =========== */

/**
  * ログ
  */
const log = (obj: any):void => {
  console.log(obj);
  logger.info(obj);
}

const python_call = ():void => {
  let options = {
    pythonPath: python_path,
    pythonOptions: ['-u'], 
    scriptPath: pythonPath,
  };
  PythonShell.run('display_clear.py', options, function (err,data) {
    if (err) throw err;
    console.log(data)
    console.log('finished');
  });
}

(async()=>{
  
  python_call();

})()