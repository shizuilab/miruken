require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger('system');

import { getActiveNode } from 'symbol-node-util';
import { Account, Address, RepositoryFactoryHttp, NetworkType, TransactionRepository, TransactionType, TransactionGroup, Transaction } from "symbol-sdk";
import {IncomingWebhook } from '@slack/webhook';
import { Display } from './display';

const display = new Display();
const exprolerUrl = process.env.EXPLORER_URL ?? 'https://testnet.symbol.fyi/';

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

const getTransfers = async (tx:any) => {
  //@ts-ignore
  await parseTxs(tx);
}

const parseTxs = async (txs:any) => {
  for(const tx of txs){
    //アグリゲートトランザクション判定
    if(tx.type === TransactionType.AGGREGATE_COMPLETE || tx.type === TransactionType.AGGREGATE_BONDED){
      //アグリゲートの場合、内部トランザクションを再取得
      const reTx:any = await txRepo.getTransaction(
        tx.transactionInfo.hash,
        TransactionGroup.Confirmed
      ).toPromise();
      console.log("== aggregateTx ==")
      //この関数を再帰的に呼び出し
      parseTxs(reTx.innerTransactions);  //再帰呼び出し
      console.log("-----------------")
    }else {
      log("== tx ==");
      if(tx.recipientAddress.plain() === account.address.plain()){
        // log(tx);
        const link = `${exprolerUrl}/transactions/${tx.transactionInfo.hash}`;
        display.call(tx.message.payload, link);
      }
    }
  }
}

(async()=>{

  console.log("start");

  const node = await getActiveNode(network_type);
  console.log(node);
  
  const repo = new RepositoryFactoryHttp(node);
  txRepo = repo.createTransactionRepository();

  // if(!display.status){
  //   // @ts-ignore
  //   display.call("hi!", account.address);
  // }

  // リスナー生成
  listener = repo.createListener();

  // リスナーオープン
  listener.open().then(() => {
    log('listner open')
    //承認トランザクションの検知
    listener.confirmed(account.address).subscribe((tx) => {
      // log(tx);
      getTransfers([tx]);
    });

    listener.webSocket.onclose = function(){
      console.log("listener onclose");
      if(webhook_url){
        const webhook = new IncomingWebhook(webhook_url);
        webhook.send({
          text: "listener onclose",
        });
      }
    }
    listenerNewBlock();
  });
})()