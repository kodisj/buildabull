import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Row,
  Col,
  FormText,
  Input,
  InputGroup,
  FormGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Collapse,
  InputGroupText,
} from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { INFTMint } from 'app/shared/model/nft-mint.model';
import { getEntity, updateEntity, createEntity, reset } from './nft-mint.reducer';

import Toggle from 'app/Toggle-Component';
import 'app/Toggle-Component.css';
import { storeResults,ipfsUpload, mint, setFormValues, setIsMinting } from './algorandMint';
import { getTypeFromMimeType, Metadata } from '../../shared/lib/metadata';
import { putToIPFS } from '../../shared/lib/ipfs';
import { NFT, Token, mediaIntegrity } from '../../shared/lib/nft';
import { SessionWallet } from 'algorand-session-wallet';
import { sessionGetActiveConf } from '../../shared/lib/config';
import { access } from 'fs';
import { Previews } from './DropzoneComponent';
import { encryptFile } from '../../shared/crypto/encrypt';
import { decryptFile } from '../../shared/crypto/decrypt';
import { bytesToDownloadableFile } from '../../shared/crypto/utils';

import * as mfsha2 from 'multiformats/hashes/sha2';
import * as digest from 'multiformats/hashes/digest';
import { base58btc } from 'multiformats/bases/base58';

import { Resolver } from 'did-resolver';
import { getResolver } from '../../shared/lib/resolver';
import { ConsoleLogger } from '@aws-amplify/core';
import { useWallet } from '@txnlab/use-wallet';
//import useWalletBalance from 'app/hooks/useWalletBalance'
import algosdk, { encodeAddress, decodeAddress, Transaction, waitForConfirmation, Algodv2, makeAssetCreateTxnWithSuggestedParamsFromObject } from 'algosdk';

import { conf } from 'app/shared/lib/config';
import { CID } from 'multiformats/cid';

import { CSSProperties } from 'react';
import { useDropzone } from 'react-dropzone';

import styled from 'styled-components';

const getColor = props => {
  if (props.isDragAccept) {
    return '#00e676';
  }
  if (props.isDragReject) {
    return '#ff1744';
  }
  if (props.isFocused) {
    return '#2196f3';
  }
  return '#eeeeee';
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;
`;

const thumbsContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16,
};

const thumb: CSSProperties = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 300,
  height: 300,
  padding: 4,
  boxSizing: 'border-box',
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden',
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%',
};



const webDidResolver = getResolver();
const didResolver = new Resolver({ ...webDidResolver });

export const NFTMintUpdate = () => {
  const dispatch = useAppDispatch();
  const { activeAddress, signTransactions, sendTransactions } = useWallet();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const nFTMintEntity = useAppSelector(state => state.documint?.nFTMint.entity);
  const loading = useAppSelector(state => state.documint?.nFTMint.loading);
  const updating = useAppSelector(state => state.documint?.nFTMint.updating);
  const updateSuccess = useAppSelector(state => state.documint?.nFTMint.updateSuccess);
  // Documint modfn starts
  const [mediaSrc, setMediaSrc] = React.useState<string>();
  const [fileObj, setFileObj] = React.useState<File>();
  const [meta, setMeta] = React.useState(new Metadata());

  const [activeConf] = React.useState(sessionGetActiveConf());
  const [encFileObj, setEncFileObj] = React.useState<File>();
  const [encBlob, setEncBlob] = React.useState<Uint8Array>();

  const [extraProps, setExtraProps] = React.useState([]);
  const [extraPropsVisible, setExtraPropsVisible] = React.useState(false);
  const [extraParamsVisible, setExtraParamsVisible] = React.useState(false);
  const [token, setToken] = React.useState(new Token({ total: 1, decimals: 0 }));
  // For MintDialog
  const [cid, setCID] = React.useState('');
  // const sw = useAppSelector(state => state.applicationProfile.sessionWallet);
  const [password, setPassword] = useState<string | null>(null);

  const [did, setDid] = useState('did:algonft:121121450');
  const [resolved, setResolved] = useState<boolean>();

  const { activeAccount, providers } = useWallet()

  const [files, setFiles] = useState([]);

  const [file, setFile] = React.useState<File>();

  const { getRootProps, getInputProps, acceptedFiles, isFocused, isDragAccept, isDragReject } = useDropzone({
    accept: {
      'image/*': [],
      'application/json': [],
    },
    onDrop: acceptedFiles => {
      setFiles(
        acceptedFiles.map(file =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
      acceptedFiles.map(file => setFile(file));
    },
    maxFiles: 1,
  });
  const fileNames = acceptedFiles.map(file => <li key={file.name}>{file.name}</li>);

  const thumbs = files.map(file => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img
          src={file.preview}
          style={img}
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
    </div>
  ));

  // useEffect(() => {
  //   // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
  //   return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  // }, []);

  function upload() {
    (async () => {
      if (encFileObj) {
        //const contentId = // await dispatch(ipfsUpload({ activeConf, fileObj: file, md:meta, sw:sw,token:token })).unwrap();
        const contentId = await dispatch(ipfsUpload({ activeConf, fileObj: file })).unwrap()
        setCID(contentId);
        console.log(contentId)
      }
    })();
  }

  function encryptFileWithPassword() {
    (async () => {
      if (file && password) {
        await setEncFile(file);
        //const encryptedFileWithPassword = await encryptFile(fileObj, password);
      } else {
        console.log('in else...');
      }
    })();
  }

  function decryptFileWithPassword() {
    (async () => {
      if (encFileObj && password) {
        const decryptedFileWithPassword = await decryptFile(encFileObj, password);
        const url = bytesToDownloadableFile(decryptedFileWithPassword);
        if (url) {
          window.open(url);
          URL.revokeObjectURL(url);
        }
      }
    })();
  }
  async function setEncFile(unencryptedFile) {
    try {
      if (unencryptedFile && password) {
        //setLoading(true);
        const parts = await encryptFile(unencryptedFile, password);
        console.log(parts);
        setEncBlob(parts);
        // Construct a file
        const f = new File([parts], file.name);

        setEncFileObj(f);

        // if (encFileObj.size === 0) {
        //   throw new Error('File encryption failed!');
        // }
      }
      //setLoading(false);
    } catch (error) {
      //setLoading(false);
      alert(`Something went wrong! ${(error as Error).message}`);
    }
  }

  useEffect(() => {
    (() => {
      if (encBlob) {
        const url = bytesToDownloadableFile(encBlob);
        if (url) {
          window.open(url);
          URL.revokeObjectURL(url);
        }
      }
    })();
  }, [encBlob]);

  //const { walletBalance, walletAvailableBalance } = useWalletBalance()

  const activeProvider = providers?.find(
    (provider) => provider.metadata.id === activeAccount?.providerId
  )

  function getClient(activeConf: number): Algodv2 {
    return new algosdk.Algodv2('', conf[activeConf].algod, '');
  }

  const handleClose = () => {
    navigate('/nft-mint' + location.search);
  };

  // useEffect(() => {
  //   if (isNew) {
  //     dispatch(reset());
  //   } else {
  //     dispatch(getEntity(id));
  //   }
  // }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    console.log('Form Values are ' + JSON.stringify(values));
    const entity = {
      ...nFTMintEntity,
      ...values,
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  async function createToken(activeConf: number, token: Token, md: Metadata): Promise<number> {


    const addr = token.reserve;
    //const suggested = await getSuggested(activeConf, 100);


    const algodclient = new algosdk.Algodv2(conf[activeConf].algodToken, conf[activeConf].algod, '');
    const suggested = await algodclient.getTransactionParams().do();
    //console.log(JSON.stringify(wallet));

    console.log(addr);
    console.log(token);
    console.log(md);
    console.log(activeConf);
    console.log(conf[activeConf]);

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

    const signedTransactions = await signTransactions([encodedTransaction]);
    const waitRoundsToConfirm = 4
    const { id } = await sendTransactions(signedTransactions, waitRoundsToConfirm)

    console.log('Successfully sent transaction. Transaction ID: ', id)
    const client = getClient(activeConf);
    const result = await waitForConfirmation(client, id, 10);

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
    return result['asset-index'];

  }

  async function alterNFT(activeConf, assetID, note, reserveAddr): Promise<number> {

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
    const waitRoundsToConfirm = 4
    const { id } = await sendTransactions(signedTransactions, waitRoundsToConfirm)

    console.log('Successfully sent transaction. Transaction ID: ', id)
    const client = getClient(activeConf);
    const result = await waitForConfirmation(client, id, 10);
    return result['asset-index'];
  }


  const createDID = values => {
    // alert(peraWallet);
    const { publicKey, checksum } = algosdk.decodeAddress(activeAccount.address);
    const mhdigest = digest.create(mfsha2.sha256.code, publicKey);
    console.log(base58btc.encode(publicKey));
    console.log(values);
    token.name = values.name;
    token.unitName = values.unitName;
    token.reserve = activeAccount.address;
    token.url = 'template-ipfs://{ipfscid:1:raw:reserve:sha2-256}';
    console.log('Token.name ' + token.name);
    console.log('Token.unitName ' + token.unitName);
    //const nft = await NFT.create(sw.wallet, activeConf, token, new Metadata(), "");
    createToken(activeConf, token, new Metadata())
      .then(tokenId => {
        try {
          token.name = values.name;
          token.unitName = values.unitName;
          const did = {
            '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/ed25519-2020/v1'],
            id: `did:algo-nft:${tokenId}`,
            authentication: [
              {
                id: `did:algo-nft:${tokenId}`,
                type: 'Ed25519VerificationKey2020',
                controller: `did:algo-nft:${tokenId}`,
                publicKeyMultibase: `${base58btc.encode(publicKey)}`,
              },
            ],
          };

          const parts = new Uint8Array(Buffer.from(JSON.stringify(did)));
          console.log(JSON.stringify(did));
          console.log('DID length is ' + parts.length);

          const f = new File([parts], values.name);
          dispatch(ipfsUpload({ activeConf, fileObj: f, md: meta, assetId: tokenId, note: parts })).unwrap()
            .then(contentId => {
              const reserveAddress = getReserveAddressFromCID(contentId)
              alterNFT(activeConf, tokenId, parts, reserveAddress).then(alteredNFTId => { setCID(contentId); })
              dispatch(storeResults({
                "did":JSON.stringify(did,null,2),
                "didLink":"https://ipfs.io/ipfs/"+contentId,
                "tokenId":tokenId}))
              navigate("/nft-mint")
               })

        } catch (error) {
          alert(error);
        }
      })
    //const tokenId = 121097513;
  };

  const getReserveAddressFromCID = (cid: string): string => {
    const cidObj = CID.parse(cid);
    console.log(cidObj);
    console.log('Hex Bytes are ' + Buffer.from(cidObj.multihash.bytes.slice(2)).toString('hex'));
    console.log('Decoding CID is ' + CID.decodeFirst(cidObj.multihash.bytes));
    console.log('ReserveAddress ' + encodeAddress(cidObj.multihash.bytes.slice(2)));
    const reserve = encodeAddress(cidObj.multihash.bytes.slice(2));
    return reserve;
  }


  const defaultValues = () =>
    isNew
      ? {}
      : {
        ...nFTMintEntity,
      };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="docuMintApp.nFTMint.home.createOrEditLabel" data-cy="NFTMintCreateUpdateHeading">
            Create your Decentralized Self Soverign Identity - DID
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={createDID}>
              {!isNew ? <ValidatedField name="id" required readOnly id="nft-mint-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField label="Name or Title for your DID " id="nft-mint-name" name="name" data-cy="name" type="text" />
              <ValidatedField label="DID Unit Name" id="nft-mint-unitName" name="unitName" data-cy="unitName" type="text" />
              <ValidatedField label="Describe your ownership and rights" id="nft-mint-desc" name="desc" data-cy="desc" type="text" />
              {/* <Previews /> */}
              {/* <section className="container">
                <div className="container">
                  <Container {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop some files here, or click to select files</p>
                  </Container>
                </div>
                <aside style={thumbsContainer}>{thumbs}</aside>
                <aside>
                  <p>Files</p>
                  <ul>{fileNames}</ul>
                </aside>
                </section>
                <ValidatedField
                  label="Password"
                  id="nft-mint-password"
                  name="password"
                  data-cy="password"
                  type="password"
                  onChange={e => setPassword(e.target.value)}
                /> */}


              {/* <Button color="primary" id="encrypt" data-cy="entityCreateSaveButton" onClick={encryptFileWithPassword}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Encrypt
              </Button>
              <Button color="primary" id="decrypt" data-cy="entityCreateSaveButton" onClick={decryptFileWithPassword}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Decrypt
              </Button>
              <Button color="primary" id="upload" data-cy="entityCreateSaveButton" onClick={upload}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Upload
              </Button> */}
              <Button color="primary" id="mint" data-cy="entityMintButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Mint my DID
              </Button>

            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default NFTMintUpdate;
