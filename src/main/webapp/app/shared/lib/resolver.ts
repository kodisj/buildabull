import fetch from 'cross-fetch';
import { DIDDocument, DIDResolutionResult, DIDResolver, ParsedDID } from 'did-resolver';

const DOC_PATH = '/.well-known/did.json';

import algosdk from 'algosdk';
import { Version } from 'multiformats';
import { encodeAddress, decodeAddress } from 'algosdk';
import { CID } from 'multiformats';
import { hasher } from 'multiformats';
import { digest } from 'multiformats';

export const ARC3_NAME_SUFFIX = '@arc3';
export const ARC3_URL_SUFFIX = '#arc3';
export const METADATA_FILE = 'metadata.json';
export const JSON_TYPE = 'application/json';

const server = 'https://node.algoexplorerapi.io/';
const port = '';
const token = '';

// const server = "https://testnet-algorand.api.purestake.io/ps2";
// const token = "lmOIh81zmm5eAPWBzq2cA7HxlAQWoV0XaucqlXgr";
// const port = "";
const purestakeToken = {
  'X-API-Key': 'lmOIh81zmm5eAPWBzq2cA7HxlAQWoV0XaucqlXgr',
};

// Instantiate the algod wrapper

let algodclient = new algosdk.Algodv2(token, server, port);

let algodIndexerClient = new algosdk.Indexer('', 'https://node.testnet.algoexplorerapi.io', '');

//let algodIndexerClient = new algosdk.Indexer(token, "https://algoindexer.algoexplorerapi.io/", "");

function resolveProtocol(url: string, reserveAddr: string) {
  if (url.endsWith(ARC3_URL_SUFFIX)) url = url.slice(0, url.length - ARC3_URL_SUFFIX.length);

  const chunks = url.split('://');
  console.log('resolve protocol:', url);
  console.log(chunks);
  // Check if prefix is template-ipfs and if {ipfscid:..} is where CID would normally be
  if (chunks[0] === 'template-ipfs' && chunks[1].startsWith('{ipfscid:')) {
    // Look for something like: template:ipfs://{ipfscid:1:raw:reserve:sha2-256} and parse into components
    chunks[0] = 'ipfs';
    const cidComponents = chunks[1].split(':');
    if (cidComponents.length !== 5) {
      // give up
      console.log('unknown ipfscid format');
      return url;
    }
    const [, cidVersion, cidCodec, asaField, cidHash] = cidComponents;

    // const cidVersionInt = parseInt(cidVersion) as CIDVersion
    if (cidHash.split('}')[0] !== 'sha2-256') {
      console.log('unsupported hash:', cidHash);
      return url;
    }
    if (cidCodec !== 'raw' && cidCodec !== 'dag-pb') {
      console.log('unsupported codec:', cidCodec);
      return url;
    }
    if (asaField !== 'reserve') {
      console.log('unsupported asa field:', asaField);
      return url;
    }
    let cidCodecCode: number = 0x55;
    if (cidCodec === 'raw') {
      cidCodecCode = 0x55;
    } else if (cidCodec === 'dag-pb') {
      cidCodecCode = 0x70;
    }

    // get 32 bytes Uint8Array reserve address - treating it as 32-byte sha2-256 hash
    const addr = decodeAddress(reserveAddr);
    const mhdigest = digest.create(0x12, addr.publicKey);

    const cid = CID.create(parseInt(cidVersion, 10) as Version, cidCodecCode, mhdigest);
    console.log('switching to id:', cid.toString());
    chunks[1] = cid.toString() + '/' + chunks[1].split('/').slice(1).join('/');
    console.log('redirecting to ipfs:', chunks[1]);
  }

  // No protocol specified, give up
  if (chunks.length < 2) return url;

  //  Switch on the protocol
  switch (chunks[0]) {
    case 'ipfs': //  Its ipfs, use the configured gateway
      //return conf[activeConf].ipfsGateway + chunks[1];
      return 'https://ipfs.io/ipfs/' + chunks[1];
    case 'https': //  Its already http, just return it
      return url;
    default:
      return '';
    // TODO: Future options may include arweave or algorand
  }

  return url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function get(url: string): Promise<any> {
  const res = await fetch(url, { mode: 'cors' });
  if (res.status >= 400) {
    throw new Error(`Bad response ${res.statusText}`);
  }
  return res.json();
}

export function getResolver(): Record<string, DIDResolver> {
  async function resolve(did: string, parsed: ParsedDID): Promise<DIDResolutionResult> {
    console.log(did);
    let err = null;
    let path = decodeURIComponent(parsed.id) + DOC_PATH;
    const id = parsed.id.split(':');
    if (id.length > 1) {
      path = id.map(decodeURIComponent).join('/');
      console.log(path);
    }

    //identifier will be the DID, i.e., did:algo-nft:asaID
    let assetUrl;
    let didDocument: DIDDocument | null = null;
    const didDocumentMetadata: any = {};
    await (async () => {
      const chunks = did.split(':');
      console.log(chunks);
      const assetInfo = await algodIndexerClient.lookupAssetByID(parseInt(chunks[2], 10)).do();
      console.log(assetInfo);
      const url = resolveProtocol('template-ipfs://{ipfscid:1:raw:reserve:sha2-256}', assetInfo.params.reserve);
      do {
        try {
          didDocument = await get(url);
          console.log(didDocument);
        } catch (error) {
          err = `resolver_error: DID must resolve to a valid https URL containing a JSON document: ${error}`;
          break;
        }

        // TODO: this excludes the use of query params
        const docIdMatchesDid = didDocument?.id === did;
        if (!docIdMatchesDid) {
          err = 'resolver_error: DID document id does not match requested did';
          // break // uncomment this when adding more checks
        }
        // eslint-disable-next-line no-constant-condition
      } while (false);
    })();
    const contentType = typeof didDocument?.['@context'] !== 'undefined' ? 'application/did+ld+json' : 'application/did+json';

    if (err) {
      return {
        didDocument,
        didDocumentMetadata,
        didResolutionMetadata: {
          error: 'notFound',
          message: err,
        },
      };
    } else {
      return {
        didDocument,
        didDocumentMetadata,
        didResolutionMetadata: { contentType },
      };
    }
  }
  return { algonft: resolve };
}
