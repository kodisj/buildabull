// import 'app/config/dayjs.ts';

import React, { useEffect} from 'react';
import { Card } from 'reactstrap';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getSession } from 'app/shared/reducers/authentication';
import { getProfile } from 'app/shared/reducers/application-profile';
import Header from 'app/shared/layout/header/header';
import Footer from 'app/shared/layout/footer/footer';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import ErrorBoundary from 'app/shared/error/error-boundary';
import { AUTHORITIES } from 'app/config/constants';
import AppRoutes from 'app/routes';

import 'react-toastify/dist/ReactToastify.css';
import './app.scss';
import * as x from 'app/ui-components';
import { AmplifyProvider } from '@aws-amplify/ui-react';
import {
  reconnectProviders,
  useInitializeProviders,
  WalletProvider,
  PROVIDER_ID,
  useWallet
} from "@txnlab/use-wallet";
import {
  walletConnected, walletDisconnected
} from 'app/shared/reducers/authentication';

import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { DaffiWalletConnect } from '@daffiwallet/connect'
import { NODE_NETWORK, NODE_PORT, NODE_TOKEN, NODE_URL } from 'app/constants/env'
import { PeraWalletConnect } from '@perawallet/connect'
import { WalletConnectModalSign } from '@walletconnect/modal-sign-html'
import algosdk from 'algosdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const baseHref = document.querySelector('base').getAttribute('href').replace(/\/$/, '');




export const App = () => {
  const dispatch = useAppDispatch();
  
  const walletProviders = useInitializeProviders({
    providers: [
      { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
      { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
      { id: PROVIDER_ID.DAFFI, clientStatic: DaffiWalletConnect },
      // { id: PROVIDER_ID.EXODUS },
      {
        id: PROVIDER_ID.WALLETCONNECT,
        clientStatic: WalletConnectModalSign,
        clientOptions: {
          projectId: process.env.NEXT_PUBLIC_WC2_PROJECT_ID || '6e082e451c0c67f3a2a0dccab798abc1',
          relayUrl: process.env.NEXT_PUBLIC_WC2_RELAY_URL,
          metadata: {
            name: 'next-use-wallet',
            description: 'Next.js @txnlab/use-wallet example',
            url: 'https://next-use-wallet.vercel.app/',
            icons: ['https://next-use-wallet.vercel.app/nfd.svg']
          },
          modalOptions: {
            explorerRecommendedWalletIds: [
              // Fireblocks desktop wallet
              '5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489'
            ]
          }
        }
      }
    ],
    nodeConfig: {
      network: NODE_NETWORK,
      nodeServer: NODE_URL,
      nodePort: NODE_PORT,
      nodeToken: NODE_TOKEN
    },
    algosdkStatic: algosdk,
    debug: true
  })

 // const { activeAccount } = useWallet()
  // useEffect(() => {
  //  // reconnectProviders(walletProviders);
  //   //dispatch(getSession());
  //   //dispatch(getProfile());
  // }, [activeAccount]);

  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated) //||
 // (activeAccount === undefined);
  if(isAuthenticated) {console.log("true in app.tsx"); dispatch(walletConnected());} else { console.log("false in app.tsx"); dispatch(walletDisconnected())};
  const isAdmin = useAppSelector(state => hasAnyAuthority(state.authentication.account.authorities, [AUTHORITIES.ADMIN]));
  const ribbonEnv = useAppSelector(state => state.applicationProfile.ribbonEnv);
  const isInProduction = useAppSelector(state => state.applicationProfile.inProduction);
  const isOpenAPIEnabled = useAppSelector(state => state.applicationProfile.isOpenAPIEnabled);

  const paddingTop = '60px';
  return (
    <AmplifyProvider>
      <WalletProvider value={walletProviders}>
      <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={baseHref}>
        <div className="app-container" style={{ paddingTop }}>
          <ToastContainer position={toast.POSITION.TOP_LEFT} className="toastify-container" toastClassName="toastify-toast" />
          <ErrorBoundary>
            <Header
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              ribbonEnv={ribbonEnv}
              isInProduction={isInProduction}
              isOpenAPIEnabled={isOpenAPIEnabled}
            />
          </ErrorBoundary>
          <div className="container-fluid view-container" id="app-view-container">
            <Card className="jh-card">
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </Card>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
      </QueryClientProvider>
      </WalletProvider>
    </AmplifyProvider>
  );
};

export default App;
