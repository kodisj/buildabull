import * as React from 'react';
import * as Styled from './modal-styled';
import Image from 'next/image';

import { ModalWrapper, ModalBackgroundDark, ModalBgColor, ModalBgImg } from './modal-styled';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, ButtonGroup, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import {
  handleSelectedWallet,
  handleDisplayWalletSelection,
} from 'app/shared/reducers/AlgorandWalletConnector';
import {
  walletConnected, walletDisconnected
} from 'app/shared/reducers/authentication';
import { getSuggested, getPayTxn } from './shared/lib/algorand';
import { useState, useEffect } from 'react';
import algosdk from 'algosdk';
import { NavDropdown } from './shared/layout/menus/menu-components';

import { useWallet } from '@txnlab/use-wallet'



export const AlgorandWalletConnector = (props: any) => {
  const dispatch = useAppDispatch();
  const con = useAppSelector(state => state.algorandWallet).connected;
  const [connected, setConnected] = useState(con);

  const activeConf = useAppSelector(state => state.applicationProfile.activeConf);

  const { providers, activeAccount } = useWallet()
  const [sw, setSw] = useState(useAppSelector(state => state.algorandWallet).sessionWallet);
  const [showModal, setShowModal] = useState(false);
  const [acct, setAcct] = useState('');



  useEffect(() => {
    console.log("refreshing for activeAccount change", activeAccount)
    providers?.map(k => {
      if(k.isActive && k.isConnected){
        dispatch(handleSelectedWallet({choice:activeAccount?.name,connected: activeAccount?.address, accts: [activeAccount?.address] }));
        //(activeAccount === undefined) ? dispatch(walletConnected()) : dispatch(walletDisconnected());
        console.log(k.metadata.name,k.isConnected,k.isActive,activeAccount?.address)
        setAcct(activeAccount?.address);
      }
    })
  }, [activeAccount]);


  function handleWallet() {
    dispatch(handleDisplayWalletSelection());
    console.log("Show wallet selection")
    setShowModal(true);
  }

  function disconnect() {
    console.log("Disconnecting...")
    providers?.map(k => {
      if(k.isConnected) k.disconnect()
      // .then(()=>{
      //   console.log(k.metadata.name,k.isConnected,k.isActive,k.accounts,activeAccount?.address)
      //   setConnected(false);
      //   setAcct(null);
      //   dispatch(handleSelectedWallet({choice:null,connected:false, accts: [] }));
      // })
     })
     setShowModal(false);
    // console.log("Done...")
    // console.log("outside loop",activeAccount.address)

  }

  const dispatchHandleClose = event => {
    setShowModal(false);
  };

  async function sign(e: any) {
    const suggested = await getSuggested(activeConf, 10);

    const comp = new algosdk.AtomicTransactionComposer();
    const pay_txn = getPayTxn(suggested, sw.getDefaultAccount());

    comp.addTransaction({ txn: pay_txn, signer: sw.getSigner() });

    console.log('Sending txn');
    //const result = await comp.execute(client, 2)
    const txns = comp.buildGroup();
    console.log(txns);
  }

  const walletOptions = [];
  providers?.map((k) => {
    walletOptions.push(
      <Styled.OptionContainer
        className="peraAlgo"
        key={k.metadata.id}
        onClick= {() => {
          k.connect()
          // .then(() => {
          //     k.setActiveProvider();
          //     console.log(k.isConnected,activeAccount.address)
          //     setConnected(k.isConnected);
          //     setShowModal(false);
          //     setAcct(activeAccount.address);
          //     //dispatch(handleSelectedWallet({choice:k.metadata.name,connected: k.isConnected, accts: [k?.accounts[0]?.address.substr(0, 8)] }));
          // })
          // console.log("Must be connected...")
        }}
      >
        <Styled.WalletName>{k.metadata.name}</Styled.WalletName>
        <Styled.WalletImage>
          <img src={k.metadata.icon} width="40" height="40" alt="wallet-logo" />
        </Styled.WalletImage>
      </Styled.OptionContainer>
    )
  })


  if (!activeAccount)
    return (
      <div>
        <Button key="connect" color="primary" minimal="true" intent="warning" outlined="true" onClick={handleWallet}>
          {activeAccount?.address?.slice(0,8) || 'Connect Wallet'}
        </Button>
        <div>
          <ModalWrapper
            key="asdfas"
            show={showModal.toString()}
isOpen={showModal}
            title="Select Wallet"
            className={'width:fit-content'}
          >
            <ModalBackgroundDark />
            <ModalBgColor />
            <ModalHeader toggle={dispatchHandleClose}>Select the wallet provider</ModalHeader>
            <ModalBody>
              <div>{walletOptions}</div>
            </ModalBody>
          </ModalWrapper>
        </div>
      </div>
    );
  return (
    <div>
      <NavDropdown icon="th-list" name={activeAccount.address.slice(0,8) || 'No Account'} id="AccountsList-menu" style={{ maxHeight: '80vh', overflow: 'auto' }}>
      <div/>
        <DropdownItem color="primary" key="asdf" onClick={disconnect}>
        <div/>
          <FontAwesomeIcon icon="ban" />
          Disconnect Wallet
        </DropdownItem>
      </NavDropdown>
    </div>
  );
};
