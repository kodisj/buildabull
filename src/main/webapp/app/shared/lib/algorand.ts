import { Wallet } from 'algorand-session-wallet';
import algosdk, { Transaction, waitForConfirmation, Algodv2, makeAssetCreateTxnWithSuggestedParamsFromObject } from 'algosdk';
import { NFT, Token } from './nft';
import { Metadata } from './metadata';
import { conf } from './config';
import { loadStdlib } from '@reach-sh/stdlib';
import { countryDialCodes } from '@aws-amplify/ui';
import {
  useWallet,
  DEFAULT_NODE_BASEURL,
  DEFAULT_NODE_TOKEN,
  DEFAULT_NODE_PORT,
} from "@txnlab/use-wallet";




export function getPayTxn(suggested: any, addr: string): Transaction {
  const txnobj = {
    from: addr,
    type: 'pay',
    to: addr,
    ...suggested,
  };
  return new Transaction(txnobj);
}

function getClient(activeConf: number): Algodv2 {
  return new algosdk.Algodv2('', conf[activeConf].algod, '');
}

function setOrUndef(addr: string): string | undefined {
  return addr === '' ? undefined : addr;
}

export async function createToken(activeConf: number, token: Token, md: Metadata): Promise<number> {
  //const { activeAddress, signTransactions, sendTransactions } = useWallet();
  const stdlib = loadStdlib('ALGO');
  stdlib.setProviderByName('TestNet');
  const mnemonic2 =
    'mimic panic fury install motion tell hover hard thumb amused answer copy utility tobacco screen festival nuclear slow cattle hamster cotton hazard basic absent develop';
  const accDeployer = await stdlib.newAccountFromMnemonic(mnemonic2);
  const { decimals } = md;
  const { metadataHash, total, creator, manager, reserve, clawback, freeze, defaultFrozen, url } = token;
  const supply = total;
  const opts = { metadataHash, clawback, supply, decimals, reserve, manager, creator, freeze, defaultFrozen, url };
  //  Launch NFT and deploy the contract
  // const nft = await stdlib.launchToken(accDeployer, md.name, md.unitName, opts);
  // //await accDeployer.tokenAccept(nft.id);
  // console.log('NFT Id is:' + nft.id);
  // return nft.id;

  const addr = token.reserve;
  //const suggested = await getSuggested(activeConf, 100);


  const algodclient = new algosdk.Algodv2(conf[activeConf].algodToken, conf[activeConf].algod, '');
  const suggested = await algodclient.getTransactionParams().do();
  //console.log(JSON.stringify(wallet));

  console.log(addr);
  console.log(token);
  console.log(md);

  const create_txn = makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: addr,
    assetName: token.name,
    unitName: token.unitName,
    assetURL: token.url,
    assetMetadataHash: md.toHash(),
    manager: addr,
    reserve: token.reserve,
    clawback: addr,
    freeze: addr,
    total: 1,
    decimals: 0,
    defaultFrozen: false,
    suggestedParams: suggested,
  });
  const encodedTransaction = algosdk.encodeUnsignedTransaction(create_txn);

  // const signedTransactions = await signTransactions([encodedTransaction]);
  //     const waitRoundsToConfirm = 4
  //     const { id } = await sendTransactions(signedTransactions, waitRoundsToConfirm)

      // console.log('Successfully sent transaction. Transaction ID: ', id)
      // const client = getClient(activeConf);
      // const result = await waitForConfirmation(client, id, 3);

  // const waitRoundsToConfirm = 4;

  // const { id } = await sendTransactions(
  //   signedTransactions,
  //   waitRoundsToConfirm
  // );
  // return id;
  // alert("Before Sign " + create_txn)
  //const [create_txn_s] = await wallet.signTxn([create_txn]);
  //const [create_txn_s] = await peraWallet.signTransaction([create_txn]);
  //const result = await sendWait(activeConf, [signedTransactions]);
  //return result['asset-index'];
  return 23423423;

}

export async function alterNFT(activeConf, assetID, note, reserveAddr): Promise<number> {
  const { activeAddress, signTransactions, sendTransactions } = useWallet();
  const addr = activeAddress;
  //const suggested = await getSuggested(activeConf, 100);
  const algodclient = new algosdk.Algodv2(conf[activeConf].algodToken, conf[activeConf].algod, '');
  const suggested = await algodclient.getTransactionParams().do();
  // Asset Creation:
  // The first transaciton is to create a new asset
  // Get last round and suggested tx fee
  // We use these to get the latest round and tx fees
  // These parameters will be required before every
  // Transaction
  // We will account for changing transaction parameters
  // before every transaction in this example
  let params = await algodclient.getTransactionParams().do();
  //comment out the next two lines to use suggested fee
  params.fee = 1000;
  params.flatFee = true;
  // console.log(params);
  // arbitrary data to be stored in the transaction; here, none is stored
  // Asset creation specific parameters
  // The following parameters are asset specific
  // Throughout the example these will be re-used.
  // We will also change the manager later in the example

  // Whether user accounts will need to be unfrozen before transacting
  let defaultFrozen = true;
  // integer number of decimals for asset unit calculation
  let decimals = 0;
  // total number of this asset available for circulation
  let totalIssuance = 1;
  // Optional hash commitment of some sort relating to the asset. 32 character length.
  // let assetMetadataHash = CryptoJS.MD5(assetURL).toString();
  let assetMetadataHash = '';
  // The following parameters are the only ones
  // that can be changed, and they have to be changed
  // by the current manager
  // Specified address can change reserve, freeze, clawback, and manager
  let manager = addr;
  // // Specified address is considered the asset reserve
  // // (it has no special privileges, this is only informational)
  let reserve = reserveAddr;
  // // // Specified address can freeze or unfreeze user asset holdings
  // let freeze = recoveredAccount1.addr;
  // // // Specified address can revoke user asset holdings and send
  // // // them to other addresses
  // let clawback = recoveredAccount1.addr;
  // // Specified address can freeze or unfreeze user asset holdings
  let freeze = null;
  // // Specified address can revoke user asset holdings and send
  // // them to other addresses
  let clawback = null;

  // Note that the change has to come from the existing manager
  let txn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
    from: addr,
    manager,
    reserve,
    note,
    assetIndex: assetID,
    strictEmptyAddressChecking: false,
    suggestedParams: params,
  });

  const encodedTransaction = algosdk.encodeUnsignedTransaction(txn)
  const signedTransactions = await signTransactions([encodedTransaction]);

  // const waitRoundsToConfirm = 4

  // const { id } = await sendTransactions(signedTransactions, waitRoundsToConfirm)

  // console.log(`Successfully sent transaction. Transaction ID: ${id}`)

  // return id;

  const result = await sendWait(activeConf, [signedTransactions]);
  return result['asset-index'];
  //   let rawSignedTxn = txn.signTxn(recoveredAccount1.sk)
  //   let tx = (await algodclient.sendRawTransaction(rawSignedTxn).do());
  //  console.log("Transaction : " + tx.txId);
}

export async function getSuggested(activeConf: number, rounds: number) {
  const txParams = await getClient(activeConf).getTransactionParams().do();
  return { ...txParams, lastRound: txParams['firstRound'] + rounds };
}

export async function getToken(activeConf: number, assetId: number): Promise<any> {
  return await getClient(activeConf).getAssetByID(assetId).do();
}

export async function getCollection(activeConf: number, address: string): Promise<any[]> {
  const results = await getClient(activeConf).accountInformation(address).do();

  const plist = [];
  for (const a in results['assets']) {
    if (results['assets'][a]['amount'] > 0) plist.push(getToken(activeConf, results['assets'][a]['asset-id']));
  }

  const assets = await Promise.all(plist);
  const collectionRequests = assets.map(a => {
    return NFT.fromToken(activeConf, a);
  });
  return Promise.all(collectionRequests);
}

export async function sendWait(activeConf: number, signed: any[]): Promise<any> {
  const client = getClient(activeConf);
  try {
    const { txId } = await client
      .sendRawTransaction(
        signed.map(t => {
          return t.blob;
        }),
      )
      .do();
    const result = await waitForConfirmation(client, txId, 3);
    return result;
  } catch (error) {
    console.error(error);
  }

  return undefined;
}

// async function waitForConfirmation(client, txId, timeout) {
//   if (client == null || txId == null || timeout < 0) {
//     throw new Error('Bad arguments.');
//   }

//   const status = await client.status().do();
//   if (typeof status === 'undefined') throw new Error('Unable to get node status');

//   const startround = status['last-round'] + 1;
//   let currentround = startround;

//   /* eslint-disable no-await-in-loop */
//   while (currentround < startround + timeout) {
//     const pending = await client.pendingTransactionInformation(txId).do();

//     if (pending !== undefined) {
//       if (pending['confirmed-round'] !== null && pending['confirmed-round'] > 0) return pending;

//       if (pending['pool-error'] != null && pending['pool-error'].length > 0)
//         throw new Error(`Transaction Rejected pool error${pending['pool-error']}`);
//     }

//     await client.statusAfterBlock(currentround).do();
//     currentround += 1;
//   }

//   /* eslint-enable no-await-in-loop */
//   throw new Error(`Transaction not confirmed after ${timeout} rounds!`);
// }
