import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import Toggle from 'app/Toggle-Component';
import 'app/Toggle-Component.css';


import { ipfsUpload, mint, setFormValues, setIsMinting } from './algorandMint';
import { getTypeFromMimeType, Metadata } from '../../shared/lib/metadata';
import { putToIPFS } from '../../shared/lib/ipfs';
import { NFT, Token, mediaIntegrity } from '../../shared/lib/nft';
import { SessionWallet } from 'algorand-session-wallet';
import { sessionGetActiveConf } from '../../shared/lib/config';
import { access } from 'fs';

//export const MinterUpdate = (props: RouteComponentProps<{ id: string }>) => {
  export const MinterUpdate = () => {
  const dispatch = useAppDispatch();

  const isNew  = undefined;
  const formValues = useAppSelector(state => state.documint.nFTMint.formValues);
  const isMinting = useAppSelector(state => state.documint.nFTMint.isMinting);
  // const metaData = useAppSelector(state => state.nft.algorandMint.meta);
  const sw = useAppSelector(state => state.applicationProfile.sessionWallet);
  //const [loading, setLoading] = useAppSelector(state => state.nft.minter.loading);
  const updating = useAppSelector(state => state.documint.nFTMint.updating);
  //const updateSuccess = useAppSelector(state => state.nft.algorandMint.updateSuccess);
  const [mediaSrc, setMediaSrc] = React.useState<string>();
  const [fileObj, setFileObj] = React.useState<File>();
  const [meta, setMeta] = React.useState(new Metadata());

  const [activeConf] = React.useState(sessionGetActiveConf());

  const [extraProps, setExtraProps] = React.useState([]);
  const [extraPropsVisible, setExtraPropsVisible] = React.useState(false);
  const [extraParamsVisible, setExtraParamsVisible] = React.useState(false);
  const [token, setToken] = React.useState(new Token({}));

  const [loading, setLoading] = React.useState(false);

  // For MintDialog
  const [cid, setCID] = React.useState('');
  // const [isMinting, setIsMinting] = React.useState(false);

  const handleClose = () => {
    //props.history.push('/minter');
  };

  const handleInputChange = event => {
    const key: string = event.target.name;
    const value: string = event.target.value;

    dispatch(setFormValues({ key, value }));
  };

  function handleChangeDecimals(v: number) {
    setToken(token_ => {
      return new Token({ ...token_, decimals: v });
    });
  }
  function handleSetTokenParams(e) {
    const tgt = e.target;
    const name = e.target.id;
    const value = tgt.type === 'checkbox' ? tgt.checked : (tgt.value as string);
    setToken(token__ => {
      return new Token({ ...token__, [name]: value });
    });
  }

  function handleChangeMeta(event: { target: any }) {
    const target = event.target;
    const name = target.name as string;
    const value = target.type === 'checkbox' ? target.checked : (target.value as string);
    setMeta(meta_ => {
      return new Metadata({ ...meta_, [name]: value });
    });
  }

  function handleShowExtraProps() {
    setExtraPropsVisible(!extraPropsVisible);
  }
  function handleShowExtraParams() {
    setExtraParamsVisible(!extraParamsVisible);
  }
  function handleExtraPropRemove(idx: number) {
    extraProps.splice(idx, 1);
    setExtraProps([...extraProps]);
  }
  function handleAddExtraProp() {
    setExtraProps([...extraProps, emptyExtraProp()]);
  }
  function emptyExtraProp() {
    return { name: '', value: '' };
  }
  function handleExtraPropUpdate(e) {
    const idx = parseInt(e.target.dataset.id, 10);
    if (e.target.id === 'name') extraProps[idx][e.target.id] = e.target.value;
    else extraProps[idx][e.target.id] = e.target.value;
    setExtraProps([...extraProps]);
  }
  function handleSetMyAddress(label: string) {
    return e => {
      setToken(token___ => {
        const addr = sw.getDefaultAccount();
        if (addr === '') alert('You need to connect you wallet before you can do this.');
        return new Token({ ...token___, [label]: addr });
      });
    };
  }

  type MediaDisplayProps = {
    mimeType: string;
    mediaSrc: string | undefined;
  };

  function MediaDisplay(props_: MediaDisplayProps) {
    const [type, _] = props_.mimeType.split('/');

    switch (type) {
      case 'audio':
        return (
          <audio id="uploaded-media" controls>
            <source src={props_.mediaSrc} type={props_.mimeType} />
          </audio>
        );
      case 'video':
        return (
          <video id="uploaded-media" controls>
            <source src={props_.mediaSrc} type={props_.mimeType} />
          </video>
        );
      default:
        return <img id="uploaded-media" alt="NFT" src={props_.mediaSrc} />;
    }
  }

  type UploaderProps = {
    mediaSrc: string | undefined;
    file: File;
    setFile(f: File): void;
  };

  function Uploader(props__: UploaderProps) {
    // alert("Entering uploader....")
    function captureFile_(event: any) {
      // alert("Entering capture file....")
      event.stopPropagation();
      event.preventDefault();
      props__.setFile(event.target.files.item(0));
    }

    if (props__.mediaSrc === undefined || props__.mediaSrc === '')
      return (
        <FormGroup>
          <Input
            type="file"
            id="exampleCustomFileBrowser"
            name="customFile"
            label={fileObj || 'choose an image file'}
            onChange={captureFile_}
            invalid={false}
          />
        </FormGroup>
      );

    return (
      <div>
        <h5>Media Input</h5>
        <MediaDisplay mimeType={props__.file.type} mediaSrc={props__.mediaSrc} />
      </div>
    );
  }
  function setFile(file: File) {
    setFileObj(file);
    // alert("Setting the file")
    const reader = new FileReader();
    reader.onload = (e: any) => {
      setMediaSrc(e.target.result);
    };
    reader.readAsDataURL(file);

    setMeta(meta_ => {
      const metaObj = {
        ...meta_,
        properties: { ...meta_.properties, size: file.size },
      };
      console.log('Type is ' + file.type, file.name);
      switch (getTypeFromMimeType(file.type)) {
        case 'audio':
          metaObj.animation_url = file.name;
          metaObj.animation_url_mimetype = file.type;
          break;
        case 'video':
          metaObj.animation_url = file.name;
          metaObj.animation_url_mimetype = file.type;
          break;
        case 'image':
          metaObj.image = file.name;
          metaObj.image_mimetype = file.type;
          break;
        default:
          metaObj.image = file.name;
          metaObj.image_mimetype = file.type;
          break;
      }
      alert(JSON.stringify(metaObj));
      return new Metadata(metaObj);
    });
  }

  function captureFile(event: any) {
    event.stopPropagation();
    event.preventDefault();
    setFile(event.target.files.item(0));
  }

  function handleCancelMint() {
    dispatch(setIsMinting(false));
    setLoading(false);
  }

  function handleSetNFT(nft: NFT) {
   // return props.history.push('/nft/' + nft.token.id);
  }

  type MintDialogProps = {
    activeConf: number;
    isMinting: boolean;
    cid: string;
    md: Metadata;
    sw: SessionWallet;
    token: Token;
    handleSetNFT(NFT);
    handleCancelMint();
  };

  const mintNFT_ = () => {
    (async () => {
      try {
        const nft = await NFT.create(activeConf, token, meta, cid);
      } catch (error) {
        alert(error);
      }
    })();
  };

  function MintDialog(props_: MintDialogProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    function cancel() {
      setIsLoading(false);
      props_.handleCancelMint();
    }
    // const mintNFT = () => {
    //   dispatch(mint({sw,activeConf,token,cid})).unwrap().then( (nft) => {console.log(nft)} );
    // }
    const mintNFT = () => {
      (async () => {
        try {
          setIsLoading(true);
          //alert("Wallet " + JSON.stringify(props_.sw.wallet)); alert("ActiveConf " + JSON.stringify(props_.activeConf)); alert("Token " + JSON.stringify(props_.token)); alert("MetaData " + JSON.stringify(props_.md)); alert("Cid " + JSON.stringify(props_.cid));
          const nft = await NFT.create(props_.activeConf, props_.token, props_.md, props_.cid);
          setIsLoading(false);
          props_.handleSetNFT(nft);
        } catch (error) {
          alert('Failed to create nft: ' + error);
          setIsLoading(false);
          props_.handleCancelMint();
        }
      })();
    };
    return (
      <Modal close isOpen={isMinting} title="Mint it">
        <ModalHeader> Ready to Mint now...</ModalHeader>
        <ModalBody>
          <div>
            <p>File uploaded to ipfs {meta.mediaURL(false)} </p>
            <p>Click Mint to create ASA</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" close>
            <FontAwesomeIcon icon="ban" />
            &nbsp; Cancel
          </Button>
          <Button color="danger" onClick={mintNFT}>
            <FontAwesomeIcon icon="trash" />
            &nbsp; Mint
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  async function captureMetadata(): Promise<Metadata> {
    const eprops = extraProps.reduce((all, ep) => {
      return { ...all, [ep.name]: ep.value };
    }, {});
    const integ = await mediaIntegrity(fileObj);

    const md = {
      name: 'name',
      unitName: 'unitName',
      decimals: 0,
      description: 'Description',
      properties: { ...eprops, ...meta.properties },
    } as Metadata;

    switch (getTypeFromMimeType(meta.mediaType(false))) {
      case 'image':
        md.image_integrity = integ;
        break;
      case 'audio':
        md.animation_url_integrity = integ;
        break;
      case 'video':
        md.animation_url_integrity = integ;
        break;
      default:
        break;
    }

    return new Metadata(md);
  }

  const uploadToIPFS = async () => {
    const md = await captureMetadata();
    setMeta(md);
    //const contentId = await dispatch(ipfsUpload({ activeConf, fileObj, md: meta, sw: null, assetId: token, note: parts })).unwrap()
 
    //await dispatch(ipfsUpload({ activeConf, fileObj, md })).unwrap();
    //setCID(contentId);
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="nftApp.minter.home.createOrEditLabel" data-cy="MinterCreateUpdateHeading">
            Mint your media on block chain
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm onSubmit={uploadToIPFS}>
              {!isNew ? <ValidatedField name="id" required readOnly id="minter-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Name"
                id="minter-name"
                name="dname"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
                onChange={handleInputChange}
              />
              <ValidatedField
                label="Unit Name"
                id="minter-unitName"
                name="unitName"
                data-cy="unitName"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
                onChange={handleInputChange}
              />
              <ValidatedField
                label="Description"
                id="minter-description"
                name="description"
                data-cy="description"
                type="textarea"
                onChange={handleInputChange}
              />
              {/* <ValidatedField label="Choose Media" id="minter-media" name="file" data-cy="description" type="file"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }} 
                onChange={handleInputChange}
              /> */}
              {/* <ValidatedField
                label="Media"
                id="minter-media"
                name="media"
                data-cy="media"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              /> */}
              <Uploader mediaSrc={mediaSrc} file={fileObj} setFile={setFile} {...meta} />
              {/* <div >
          <Button onClick={handleShowExtraParams} text={extraPropsVisible ? 'Hide extra parameters' : 'Show extra parameters'} id="extraParamsAdd" data-cy="extraPropAdd" replace color="info">
            <FontAwesomeIcon icon="arrow-right" />
            &nbsp;
            <span className="d-none d-md-inline">Add Extra Parameters</span>
          </Button>
          &nbsp;
          <Collapse isOpen={extraParamsVisible}>
            <InputGroup>
              <InputGroupText>Decimals</InputGroupText>
              <Input placeholder="A value of > 0 is considered a 'Fractional NFT'" type="number" step="1"  onValueChange={handleChangeDecimals}/>
            </InputGroup>
            &nbsp;
            <div  >

            <Toggle
          checked={false}
          text="Default Frozen"
          size="large"
          disabled={false}
          onChange={handleSetTokenParams}
          offstyle="btn-danger"
          onstyle="btn-success"
        />
 &nbsp;
<InputGroup>
    <InputGroupText>
    The Manager Address for this asset
    </InputGroupText>
    <Input type="text" name="manager" id = "manager" placeholder="Manager Address, click me button to select yours"  value={token.manager} onChange={handleSetTokenParams} />
    <Button onClick={handleSetMyAddress('manager')}>
      Me
    </Button>
  </InputGroup>
  &nbsp;
  <InputGroup>
    <InputGroupText>
    The Reserve Address for this asset
    </InputGroupText>
    <Input type="text" name="reserve" id = "reserve" placeholder="Reserve Address, click me button to select yours"  value={token.reserve} onChange={handleSetTokenParams} />
    <Button onClick={handleSetMyAddress('reserve')}>
      Me
    </Button>
  </InputGroup>
  &nbsp;
  <InputGroup>
    <InputGroupText>
    The Clawback Address for this asset
    </InputGroupText>
    <Input type="text" name="clawback" id = "clawback" placeholder="Clawback Address, click me button to select yours"  value={token.clawback} onChange={handleSetTokenParams} />
    <Button onClick={handleSetMyAddress('manager')}>
      Me
    </Button>
  </InputGroup>
  &nbsp;
  <InputGroup>
    <InputGroupText>
    The Freeze Address for this asset
    </InputGroupText>
    <Input type="text" name="freeze" id = "freeze" placeholder="Freeze Address, click me button to select yours"  value={token.freeze} onChange={handleSetTokenParams} />
    <Button onClick={handleSetMyAddress('manager')}>
      Me
    </Button>
  </InputGroup>
  &nbsp;
            </div>
          </Collapse>
        </div>

        <div>
          <Button onClick={handleShowExtraProps} text={extraPropsVisible ? 'Hide extra props' : 'Show extra props'} id="extraPropAdd" data-cy="extraPropAdd" replace color="info">
            <FontAwesomeIcon icon="arrow-left" />
            &nbsp;
            <span className="d-none d-md-inline">Show Extra Properties</span>
          </Button>
          <Collapse isOpen={extraPropsVisible} className="extra-prop-collapse">
            <p>Add string keys and values</p>
            <ul className="extra-prop-list">
              {extraProps.map((_props, idx) => {
                return (
                  <div  key={idx}>
                    <div className="d-flex flex-row" >
                      <InputGroup
                        id="name"
                        data-id={idx}
                        name="name"
                        value={_props.name}
                        onChange={handleExtraPropUpdate}
                        className="d-flex align-items-center"
                      >

                        <Button>Key</Button>
                        <Input placeholder="Enter your key here" />

                      </InputGroup>
                      
                      <InputGroup
                        id="value"
                        name="value"
                        data-id={idx}
                        value={_props.value}
                        onChange={handleExtraPropUpdate}
                        className="d-flex align-items-center"
                        >

                        <Button>Value</Button>
                        <Input placeholder="Enter your value here" />
                      </InputGroup>
                      <Button
                      color="primary"
                        onClick={() => {
                          handleExtraPropRemove(idx);
                        }}
                        className="d-flex align-items-center"
                        close
                      /> 
                      &nbsp;
                    </div>
                  </div>
                );
              })}
            </ul>
           
            <Button onClick={handleAddExtraProp} tag={Link} id="extraPropAdd" data-cy="extraPropAdd" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Add a Key Value Pair</span>
            </Button>


          </Collapse>
        </div> */}
              <div className="container custom-note-field"></div>
              <Button
                icon="fa-solid fa-arrow-right"
                tag={Link}
                id="cancel-save"
                data-cy="entityCreateCancelButton"
                to="/minter"
                replace
                color="info"
              >
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Upload
              </Button>
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" onClick={mintNFT_} disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Mint
              </Button>
              <MintDialog
                activeConf={activeConf}
                token={token}
                isMinting={isMinting}
                cid={cid}
                md={meta}
                sw={sw}
                handleSetNFT={handleSetNFT}
                handleCancelMint={handleCancelMint}
              ></MintDialog>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default MinterUpdate;
