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

// const newBlock = (block:any):void => {
//   console.log(block);
//   if(!status.loading){
//     python_call("message", targetAddress);
//   }
// }

// const getTransfers = async (block:any) => {
//   try {
//     const tx = await txRepo.search({
//       height: block.height.compact(),
//       group: TransactionGroup.Confirmed
//     }).toPromise();
//     //@ts-ignore
//     log('tx: '+tx.data.length);
//     //@ts-ignore
//     await parseTxs(tx.data);
//   } catch (error) {
//     console.error(error);
//   }
// }

// const parseTxs = async (txs:Array<Transaction>) => {
//   for(const tx of txs){
//     //アグリゲートトランザクション判定
//     if(tx.type === TransactionType.AGGREGATE_COMPLETE || tx.type === TransactionType.AGGREGATE_BONDED){
//       //アグリゲートの場合、内部トランザクションを再取得
//       const reTx = await txRepo.getTransaction(
//         tx.transactionInfo.hash,
//         TransactionGroup.Confirmed
//       ).toPromise();
//       console.log("== aggregateTx ==")
//       //この関数を再帰的に呼び出し
//       parseTxs(reTx.innerTransactions);  //再帰呼び出し
//       console.log("-----------------")
//     }else {
//       log("== tx ==");
//       log(tx);
//       // if(tx.mosaics !== undefined){
//       //   tx.mosaics.forEach(mosaic => {
//       //     log(mosaic);
//       //   });
//       // }
//     }
//   }
// }

(async()=>{

  const node = await getActiveNode(network_type);
  const repo = new RepositoryFactoryHttp(node);
  txRepo = repo.createTransactionRepository();
  const display = new Display();

  if(!display.status){
    display.call("on loading", account.address);
  }

  // // リスナー生成
  // listener = repo.createListener();
  // // リスナーオープン
  // listener.open().then(() => {
  //   log('listner open')
  //   listener.newBlock().subscribe((block:any) => {
  //     getTransfers(block);
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