require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger('system');

import { getActiveNode } from 'symbol-node-util';
import { Address, RepositoryFactoryHttp, NetworkType } from "symbol-sdk";
import {IncomingWebhook } from '@slack/webhook';
import { PythonShell } from 'python-shell';

interface Status {
  loading: boolean
}

interface FileList {
  filename: string
}


let status: Status = {
  loading: false
}

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
const targetRawAddress: string = 'TDKIFJKKDGLJMCPN35LL7YILCLU5L3PE4FJASQY';
const webhook_url: string | undefined = process.env.SLACK_WEBHOOK_URL;
const python_path: string = process.env.PYTHON_PATH ?? '/usr/bin/python3';
/** =========== */
// @ts-ignore
let listener:any;
let network_type: number = NetworkType.TEST_NET;
if(process.env.NETWORK_TYPE === 'mainnet'){
  network_type = NetworkType.MAIN_NET;
}

/**
  * ログ
  */
const log = (obj: any):void => {
  console.log(obj);
  logger.info(obj);
}

const listenerNewBlock = ():void => {
  listener.newBlock();
  setTimeout(listenerNewBlock, 50000);
}

const python_call = ():void => {
  let options = {
    pythonPath: python_path,
    pythonOptions: ['-u'], 
    scriptPath: '/home/pi/src/miruken/python',
    // scriptPath: '/home/pi/src/miruken/python',
    args: ['文字入れテストです', "address"]
  };
  PythonShell.run('main.py', options, function (err,data) {
    if (err) throw err;
    console.log(data)
    console.log('finished');
    status.loading = false
  });
}

(async()=>{
  
  python_call();

  const targetAddress = Address.createFromRawAddress(targetRawAddress);
  const node = await getActiveNode(network_type);
  const repo = new RepositoryFactoryHttp(node);
  // リスナー生成
  // listener = repo.createListener();
  // // リスナーオープン
  // listener.open().then(() => {
  //   log('listner open')
  //   listener.newBlock().subscribe((block:any) => {
  //     log(block)
  //     console.log(status);
  //     if(!status.loading){
  //       python_call();
  //     }

  //     // newBlock(block);
  //   });

  //   listener.webSocket.onclose = function(){
  //     console.log("listener onclose");
  //     if(webhook_url){
  //       const webhook = new IncomingWebhook(webhook_url);
  //       webhook.send({
  //         text: "listener onclose",
  //       });
  //     }
  //   }
  //   listenerNewBlock();
  // });
})()