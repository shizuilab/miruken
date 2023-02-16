require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger('system');

import { getActiveNode } from 'symbol-node-util';
import { Account, Address, RepositoryFactoryHttp, NetworkType, TransactionRepository, TransactionType, TransactionGroup, Transaction } from "symbol-sdk";
import {IncomingWebhook } from '@slack/webhook';
import { Display } from './display';

let txRepo: TransactionRepository;

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
const webhook_url: string | undefined = process.env.SLACK_WEBHOOK_URL;
/** =========== */
// @ts-ignore
let listener:any;
let network_type: number = NetworkType.TEST_NET;
if(process.env.NETWORK_TYPE === 'mainnet'){
  network_type = NetworkType.MAIN_NET;
}
const account: Account = Account.createFromPrivateKey(process.env.PRIVATE_KEY ?? '', network_type);

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


(async()=>{

  const node = await getActiveNode(network_type);
  const repo = new RepositoryFactoryHttp(node);
  txRepo = repo.createTransactionRepository();
  const display = new Display();

  if(!display.status){
    display.call("on loading", account.address);
  }


})()