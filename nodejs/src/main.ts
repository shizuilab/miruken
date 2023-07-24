require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger('system');

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

//import { getActiveNode } from 'symbol-node-util';
import { Account, Address, RepositoryFactoryHttp, NetworkType, TransactionRepository, TransactionType, TransactionGroup, Transaction } from "symbol-sdk";
import {IncomingWebhook } from '@slack/webhook';
import { Display } from './display';

const display = new Display();
const exprolerUrl = process.env.EXPLORER_URL ?? 'https://testnet.symbol.fyi';

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

// const account: Account = Account.createFromPrivateKey(process.env.PRIVATE_KEY ?? '', network_type);
// type ACCOUNT_PKEYS = string[];
const accounts: Account[] = [Account.createFromPrivateKey(process.env.ACCOUNT_PKEY_1 ?? '', network_type),
                             Account.createFromPrivateKey(process.env.ACCOUNT_PKEY_2 ?? '', network_type),
                             Account.createFromPrivateKey(process.env.ACCOUNT_PKEY_3 ?? '', network_type),
                             Account.createFromPrivateKey(process.env.ACCOUNT_PKEY_4 ?? '', network_type),
                             Account.createFromPrivateKey(process.env.ACCOUNT_PKEY_5 ?? '', network_type),
                             ];
// ['NCQRNQBQOIRWJM6MUK2D4SFD55EV46YYNBNYM2A','NBMOXYQPCL72TAB4NEZZ7PBKPU6NCKZKZ34OI3Y','NAUSWZ5BFBBVPR65TRASFRZKTR5Q5BEHCEG34LA','NBZ5FVEAIPBZFQT23C52TXBLYJMQKTPW633EKJQ','NAUSWZ5BFBBVPR65TRASFRZKTR5Q5BEHCEG34LA'];
console.log (accounts);

/**
  * ログ
  */
const log = (obj: any):void => {
  console.log(obj);
  logger.info(obj);
}

const listenerNewBlock = ():void => {
  listener.newBlock();
  setTimeout(listenerNewBlock, 60000);
}

const getTransfers = async (tx:any, idx:number) => {
  //@ts-ignore
  await parseTxs(tx, idx);
}

const parseTxs = async (txs:any, idx:number) => {
  for(const tx of txs){
    //アグリゲートトランザクション判定
    if(tx.type === TransactionType.AGGREGATE_COMPLETE || tx.type === TransactionType.AGGREGATE_BONDED){
      //アグリゲートの場合、内部トランザクションを再取得
      const reTx:any = await txRepo.getTransaction(
        tx.transactionInfo.hash,
        TransactionGroup.Confirmed
      ).toPromise();
      log("== aggregateTx ==")
      //この関数を再帰的に呼び出し
      parseTxs(reTx.innerTransactions, idx);  //再帰呼び出し
      log("-----------------")
    }else {
      log("== tx ==");
      if(tx.recipientAddress.plain() === accounts[idx].address.plain()){
        // log(tx);
        const link = `${exprolerUrl}/transactions/${tx.transactionInfo.hash}`;
        display.call(tx.message.payload, link);
      }
    }
  }
}

(async()=>{

  log("start");

  const node = "http://dual-01.dhealth.cloud:3000";
  // const node = await getActiveNode(network_type);
  log(node);
  
  const repo = new RepositoryFactoryHttp(node);
  txRepo = repo.createTransactionRepository();

  // if(!display.status){
  //   // @ts-ignore
  //   display.call("hi!", account.address);
  // }

  for (let index  = 0; index < accounts.length; index++) {
    // リスナー生成
    listener = repo.createListener();

    // リスナーオープン
    await listener.open().then(() => {
      log('listner open')
      //承認トランザクションの検知
      listener.confirmed(accounts[index].address).subscribe((tx) => {
        // log(tx);
        getTransfers([tx],index);
      });

      listener.webSocket.onclose = function(){
        log("listener onclose");
      }
      listenerNewBlock();
    });
  }
})()
