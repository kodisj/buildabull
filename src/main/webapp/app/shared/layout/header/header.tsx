import './header.scss';

import React, { useState } from 'react';

import { Navbar, Nav, NavbarToggler, Collapse } from 'reactstrap';
import LoadingBar from 'react-redux-loading-bar';

import { Home, Brand, Individual, Institution, Pricing, Contact, MintYourDID } from './header-components';
import { AdminMenu, EntitiesMenu, AccountMenu } from '../menus';
import { NetworkSelector } from 'app/NetworkSelector';

import { conf, sessionGetActiveConf, sessionSetActiveConf } from '../../lib/config';

import { AlgorandWalletConnector } from '../../../AlgorandWalletConnector';
import { SessionWallet } from 'algorand-session-wallet';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { setActiveConf, setSessionWallet } from 'app/shared/reducers/application-profile';
import Connect from 'app/shared/auth/Connect';
import Authenticate from 'app/shared/auth/Authenticate';
import NFTMintUpdate from 'app/entities/nft-mint/nft-mint-update';
import MenuItem from '../menus/menu-item';
import { useWallet } from '@txnlab/use-wallet';

export interface IHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isOpenAPIEnabled: boolean;
}

const Header = (props: IHeaderProps) => {
  const idx_ = conf.findIndex(cfg => cfg.network === 'TestNet');
  if (idx_ > -1) {
    sessionSetActiveConf(idx_);
  }
  let menuOpen:boolean = useAppSelector(state => state.authentication.isAuthenticated); //useState(false);
  const [activeConf, setActiveNetwork] = React.useState(sessionGetActiveConf());
  const { activeAccount } = useWallet()

  //const [connected, setConnected] = useAppSelector(state => state.algorandWallet.connected);

  const dispatch = useAppDispatch();

  // const network = new URLSearchParams(props.location.search).get('network');
  // if (network) {

  //}

  // function updateWallet(sw_: SessionWallet) {
  //   // setSessWallet(sw_);
  //   // setAccounts(sw_.accountList());
  //   // setConnected(sw_.connected());
  //   dispatch(setSessionWallet(sw_));
  // }

  const renderDevRibbon = () =>
    props.isInProduction === false ? (
      <div className="ribbon dev">
        <a href="">Development</a>
      </div>
    ) : null;

  const toggleMenu = () => (menuOpen = !menuOpen);

  function selectNetwork(idx: number) {
    sessionSetActiveConf(idx);
    setActiveConf(idx);
    dispatch(setActiveConf(idx));
  }

  /* jhipster-needle-add-element-to-menu - JHipster will add new menu items here */
  if (activeAccount){
    menuOpen = true;
  }
  return (
    <div id="app-header">
      <LoadingBar className="loading-bar" />
      <Navbar data-cy="navbar" dark expand="md" fixed="top" className="bg-primary">
        <NavbarToggler aria-label="Menu" onClick={toggleMenu} />
        <Brand />

        <Collapse navbar>
          <Nav id="header-tabs" className="ms-auto" navbar>
            {/* {!menuOpen && <Home />}
            {!menuOpen && <Institution />}
            {!menuOpen && <Individual />}
            {!menuOpen && <Pricing />}
            {!menuOpen && <Contact />} */}

            {/* </Nav>
        </Collapse>
        <Collapse isOpen={menuOpen} navbar>
          <Nav id="header-tabs" className="ms-auto" navbar>
            <NetworkSelector activeConf={activeConf} selectNetwork={selectNetwork} /> */}
           {/* <Connect /> */}
            {/* <Authenticate /> */}


            <AlgorandWalletConnector/>
            
            { menuOpen && <MintYourDID/>}
            

            {/* <NFTMintUpdate /> */}
            {/* {menuOpen && <EntitiesMenu />} */}
            {/* {!menuOpen && props.isAdmin && <AdminMenu showOpenAPI={props.isOpenAPIEnabled} showDatabase={!props.isInProduction} />}
            {!menuOpen && <NetworkSelector activeConf={activeConf} selectNetwork={selectNetwork} />}
            <AccountMenu isAuthenticated={props.isAuthenticated} /> */}
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default Header;
