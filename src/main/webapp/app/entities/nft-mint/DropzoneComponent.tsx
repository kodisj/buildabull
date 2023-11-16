import React, { useEffect, useState, CSSProperties } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { encryptFile } from '../../shared/crypto/encrypt';
import { decryptFile } from '../../shared/crypto/decrypt';
import { bytesToDownloadableFile } from '../../shared/crypto/utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import styled from 'styled-components';
import { ipfsUpload, mint, setFormValues, setIsMinting } from './algorandMint';
import { sessionGetActiveConf } from '../../shared/lib/config';
import { getTypeFromMimeType, Metadata } from '../../shared/lib/metadata';
import { NFT, Token, mediaIntegrity } from '../../shared/lib/nft';

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

export const Previews = props => {
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState([]);
  const [encFileObj, setEncFileObj] = React.useState<File>();
  const [file, setFile] = React.useState<File>();
  const [encBlob, setEncBlob] = React.useState<Uint8Array>();
  const [password, setPassword] = useState<string | null>(null);
  const [cid, setCID] = React.useState('');
  const [meta, setMeta] = React.useState(new Metadata());
  const [activeConf] = React.useState(sessionGetActiveConf());
  const sw = useAppSelector(state => state.applicationProfile.sessionWallet);
  const [token, setToken] = React.useState(new Token({ total: 1, decimals: 0 }));
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

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, []);

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

  return (
    <section className="container">
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
      <ValidatedField
        label="Password"
        id="nft-mint-password"
        name="password"
        data-cy="password"
        type="password"
        onChange={e => setPassword(e.target.value)}
      />
      <Button color="primary" id="encrypt" data-cy="entityCreateSaveButton" onClick={encryptFileWithPassword}>
        <FontAwesomeIcon icon="save" />
        &nbsp; Encrypt
      </Button>
      <Button color="primary" id="decrypt" data-cy="entityCreateSaveButton" onClick={decryptFileWithPassword}>
        <FontAwesomeIcon icon="save" />
        &nbsp; Decrypt
      </Button>
      <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" onClick={upload}>
        <FontAwesomeIcon icon="save" />
        &nbsp; Upload
      </Button>
    </section>
  );
};
