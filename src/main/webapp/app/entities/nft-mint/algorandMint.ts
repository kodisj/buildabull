import axios from 'axios';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getTypeFromMimeType, Metadata } from 'app/shared/lib/metadata';
import { putToIPFS } from 'app/shared/lib/ipfs';
import { NFT, Token, mediaIntegrity } from '../../shared/lib/nft';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getProfile } from 'app/shared/reducers/application-profile';

import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';
import { SessionWallet, allowedWallets } from 'algorand-session-wallet';



const initialState = {
  loading: false,
  // meta: new Metadata({}),
  accts: [],
  isMinting: false,
  cid: 'NoNetwork',
  formValues: {},
  did:"",
  tokenId:-1,
  didLink:""
};

//const sw = useAppSelector(state => state.applicationProfile.sessionWallet);
//const activeConf = useAppSelector(state => state.applicationProfile.activeConf);

export type AlgorandMintState = Readonly<typeof initialState>;

interface IMintParams {
  token: Token;
  // meta: Metadata,
  cid: string;
  activeConf: number;
  sw: SessionWallet;
}
export const mint = createAsyncThunk('nft/mint', async (params: IMintParams) => {
  const nft = await NFT.create(params.activeConf, params.token, new Metadata(), params.cid);
  return nft;
});

interface IUploadIpfsParams {
  fileObj: File;
  md?: Metadata;
  activeConf?: number;
  assetId?: number;
  note?: Uint8Array;
}

export const ipfsUpload = createAsyncThunk('ipfs/upload', async (params: IUploadIpfsParams) => {
  try {
    const cid: string = await putToIPFS(params.activeConf, params.fileObj);
    console.log('CID is ' + cid);
    return cid;
  } catch (error) {
    alert('Failed to create nft: ' + error);
    return '';
  }
});


// Actions
interface IkeyValue {
  key: string;
  value: string;
}

interface IResults {
  tokenId: number;
  didLink: string;
  did: string;
}
export const AlgorandMintSlice = createSlice({
  name: 'algorandMint',
  initialState: initialState as AlgorandMintState,
  reducers: {
    reset() {
      return initialState;
    },
    storeResults(state,action:PayloadAction<any>){
      state.did = action.payload.did;
      state.didLink = action.payload.didLink;
      state.tokenId = action.payload.tokenId;
    },
    setFormValues(state, action: PayloadAction<IkeyValue>) {
      //  state.formValues = {...state.formValues, [action.payload.key]:action.payload.value}
    },
    setIsMinting(state, action: PayloadAction<boolean>) {
      state.isMinting = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(ipfsUpload.pending, state => {
        state.loading = true;
      })
      .addCase(ipfsUpload.rejected, (state, action) => ({
        ...initialState,
        loading: false,
        isMinting: false,
        errorMessage: action.error.message,
      }))
      .addCase(ipfsUpload.fulfilled, (state, action) => ({
        ...initialState,
        loading: false,
        isMinting: true,
        // return history.push('/nft/' + nft.token.id);
        successMessage: 'Successfully minted the NFT!',
      }))
      .addCase(mint.pending, state => {
        state.loading = true;
      })
      .addCase(mint.rejected, (state, action) => ({
        ...initialState,
        loading: false,
        isMinting: false,
        errorMessage: action.error.message,
      }))
      .addCase(mint.fulfilled, (state, action) => ({
        ...initialState,
        loading: false,
        // return history.push('/nft/' + nft.token.id);
        successMessage: 'Successfully minted the NFT!',
      }));
  },
});

export const { reset, setFormValues, setIsMinting,storeResults } = AlgorandMintSlice.actions;

// Reducer
export default AlgorandMintSlice.reducer;
