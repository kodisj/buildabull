import { ipfsURL } from './nft';
import { Metadata } from './metadata';
import { conf } from './config';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { peerIdFromKeys, peerIdFromString, peerIdFromBytes } from '@libp2p/peer-id';
// import { generateKeyPair } from '@libp2p/crypto/keys'
// import { randomBytes } from '@libp2p/crypto'
// import type { PeerId } from '@libp2p/interface-peer-id'
import { createEd25519PeerId } from '@libp2p/peer-id-factory';
import * as Name from 'w3name';
import { create, publish } from 'w3name';
import algosdk from 'algosdk';
/*
 Currently an issue with resolving ipfs-car module in web3.storage when using react-scripts
 We just use the prebuilt one but with no types we have to just ignore the issue for now
//import { Web3Storage } from 'web3.storage'
*/

import { Web3Storage } from 'web3.storage';
import * as ipns from 'ipns';
// import {extractPublicKey} from 'ipns/utils'
import * as hasher from 'multiformats/hashes/hasher';
import crypto from 'crypto';
import multibase from 'multibase';
import multihash from 'multihashes';
import { base36 } from 'multiformats/bases/base36';

const PUBLIC_KEY_BYTE_LENGTH = 32;
const PRIVATE_KEY_BYTE_LENGTH = 64; // private key is actually 32 bytes but for historical reasons we concat private and public keys
const KEYS_BYTE_LENGTH = 32;

function concatKeys(privateKeyRaw: Uint8Array, publicKey: Uint8Array) {
  const privateKey = new Uint8Array(PRIVATE_KEY_BYTE_LENGTH);
  for (let i = 0; i < KEYS_BYTE_LENGTH; i++) {
    privateKey[i] = privateKeyRaw[i];
    privateKey[KEYS_BYTE_LENGTH + i] = publicKey[i];
  }
  return privateKey;
}

function ReserveAddressFromCID(cidToEncode) {
  const decodedMultiHash = multihash.decode(cidToEncode.Hash());
  // if err != nil {
  //     return "", fmt.Errorf("failed to decode ipfs cid: %w", err))
  // }
  return algosdk.encodeAddress(decodedMultiHash.digest);
}

async function createAlgorandPublicKey(cidStr) {
  const account = algosdk.generateAccount();
  const mn = algosdk.secretKeyToMnemonic(account.sk);
  console.log('Account Mnemonic:', mn);

  console.log('account', account);

  const { publicKey, checksum } = algosdk.decodeAddress(account.addr);

  const buffer = Buffer.from(publicKey);
  const pubKeyBase64: string = buffer.toString('base64');
  console.log('Public Key Base64: ', pubKeyBase64);
  const pubKeyArray: Uint8Array = Buffer.from(pubKeyBase64, 'base64');
  const address = algosdk.encodeAddress(pubKeyArray);
  console.log('account.addr === address', account.addr === address);
  console.log('account.addr', account.addr);
  console.log('address', address);
  console.log('public key', publicKey);
  console.log(account.sk);
  console.log(concatKeys(account.sk, publicKey));
  console.log('checksum', checksum);

  // return {
  //   address: account.addr,
  //   publicKey: publicKey,
  // }
}

async function createW3Name(cidStr) {
  const name = await Name.create();
  console.log('Name:', name.toString());
  // e.g. k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt

  // The value to publish

  const revision = await Name.v0(name, '/ipfs/' + cidStr);

  await Name.publish(revision, name.key);
  // Make a revision to the current record (increments sequence number and sets value)
  // const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
  // const nextRevision = await Name.increment(revision, value)
  // await Name.publish(nextRevision, name.key)
}
async function createIPNSRecord(cidStr, validity, sequence) {
  //const rsa = await generateKeyPair('RSA', 2048)
  //let peerId:PeerId = await peerIdFromKeys(rsa.public.bytes, rsa.bytes)
  const ed25519 = await createEd25519PeerId();
  console.log('PeerId: ' + ed25519.type + ' ' + ed25519.privateKey + ' ' + ed25519.toString() + '  ' + ed25519.toCID());
  const account = algosdk.generateAccount();
  const { publicKey, checksum } = algosdk.decodeAddress(account.addr);
  console.log('Public Key ' + publicKey);
  console.log('Private Key ' + account.sk);
  console.log('Public Key ' + publicKey.toString());
  console.log('Private Key ' + account.sk.toString());

  const libp2pHeaderBytes = [8, 1, 18, 64];

  // const privKey = Buffer.from([8,1,18,64,210,161,200,112,245,236,154,25,235,32,28,101,45,249,3,112,66,182,106,2,119,14,25,102,207,149,181,4,149,16,186,231,79,3,82,99,198,92,107,88,46,143,12,245,86,0,11,64,254,210,196,26,3,79,112,230,101,211,216,50,158,74,102,224])
  // const algoPrivKey = Buffer.from([8,1,18,64,248,35,152,89,22,144,145,37,96,222,71,26,249,189,229,48,61,11,104,216,10,131,73,252,101,180,46,156,225,35,89,63,99,10,33,202,26,194,129,230,231,75,202,249,89,97,47,255,107,152,250,23,90,234,100,246,182,156,229,222,39,149,154,164])
  // // you have to prepend your base36 string with "k":
  // const decoded = base36.decode("k51qzi5uqu5dhn7jxmheb3opz1jku7y8w4q7b5as2zwb43jp5kld8nkxe60btr")
  // console.log(decoded)

  // // don't forget to remove the leading "k":
  // const reEncoded = base36.encode(decoded)
  // console.log(reEncoded)

  // console.log("PrivKey length is " + privKey.length)

  // var u8 = new Uint8Array(account.sk);
  // var b64 = Buffer.from(u8)//.toString('base64');
  // const bytes = multibase.encode('base36', b64)
  // console.log("Base36 Encoded " + new TextDecoder().decode())
  //const name = Name.parse(reEncoded)
  const name = await Name.from(Buffer.from(libp2pHeaderBytes.concat(Array.from(account.sk))));
  console.log('Name:', name.toString());
  console.log(cidStr);
  //const revision = await Name.v0(name, '/ipfs/'+ 'bafkreibwm7utr5xwr22yc3qa27ad7n25piqeoxujditjrmdhdozpvyu4zy')
  const revision = await Name.v0(name, '/ipfs/' + cidStr);
  await Name.publish(revision, name.key);

  //const nextRevision = await Name.increment(revision, '/ipfs/' + cidStr)
  //await Name.publish(nextRevision, name.key)

  // const libp2pHasher = hasher.from({
  //   // As per multiformats table
  //   // https://github.com/multiformats/multicodec/blob/master/table.csv#L9
  //   name: 'libp2p-key',
  //   code: 0x72,

  //   encode: (input) => new Uint8Array(crypto.createHash('sha256').update(input).digest())
  // })
  // const libp2pPublicKey = await libp2pHasher.digest(publicKey)
  //  let peerId:PeerId = await peerIdFromBytes(Buffer.from(libp2pHeaderBytes.concat(Array.from(account.sk))))
  // // console.log(peerId)
  //  const cid = uint8ArrayFromString(cidStr)
  // // console.log("CID: ",cid)
  // // const sequence = 0
  // // const validity = 1000000
  // const entryData = await await ipns.create(peerId, cid, sequence,validity)
  // //const pk = extractPublicKey(ed25519, entryData)
  // console.log(entryData.pubKey)
  //return name.toString();
  return cidStr;
}

export async function putToIPFS(activeConf: number, file: File): Promise<string> {
  console.log(conf[activeConf].storageToken);
  const storage = new Web3Storage({ token: conf[activeConf].storageToken });
  console.log(conf[activeConf].storageToken);
  const cid: string = await storage.put([file], { wrapWithDirectory: false });
  console.log(ipfsURL(cid));
  return cid;

  // const cidStr:string = await storage.put([md.toFile()], { wrapWithDirectory: false });
  //const sequence = 0;
  //const validity = 1000000;
  //const ipnsName = await createIPNSRecord(imgAdded, validity, sequence);
  //await createW3Name(cidStr)
  //await createAlgorandPublicKey(cidStr)
  //return ipnsName;
}

export async function getMimeTypeFromIpfs(url: string): Promise<string> {
  const req = new Request(url, { method: 'HEAD' });
  const resp = await fetchWithTimeout(url, {
    timeout: 10000,
  });
  console.log('DID Doc is ' + resp.json());
  return resp.headers.get('Content-Type');
}

export async function getMetaFromIpfs(url: string): Promise<Metadata> {
  const req = new Request(url);
  const resp = await fetch(req);
  const body = await resp.blob();
  const text = await body.text();
  const parsed = JSON.parse(text);
  return new Metadata({ _raw: text, ...parsed });
}

export const Timeout = time => {
  let controller = new AbortController();
  setTimeout(() => controller.abort(), time * 1000);
  return controller;
};

async function fetchWithTimeout(resource, options) {
  const { timeout } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  console.log('Returning resp ' + response.json());
  return response;
}
