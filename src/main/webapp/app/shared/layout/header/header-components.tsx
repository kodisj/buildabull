import React from 'react';

import { NavItem, NavLink, NavbarBrand } from 'reactstrap';
import { NavLink as Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DocumintLogo } from 'app/ui-components';


export const BrandIcon = props => (
  <div {...props} className="brand-icon">
    <img src="" alt="Logo" />
  </div>
);

export const Brand = () => (
  <NavbarBrand tag={Link} to="/home" className="brand-logo">
    {/* <DocumintLogo /> */}
    <span className="brand-title">AlgoDID-NFT</span>
    <span className="navbar-version">{VERSION}</span>
  </NavbarBrand>
);

export const Home = () => (
  <NavItem>
    <NavLink tag={Link} to="/home" className="d-flex align-items-center">
      <FontAwesomeIcon icon="home" />
      <span>Home</span>
    </NavLink>
  </NavItem>
);

export const Institution = () => (
  <NavItem>
    <NavLink tag={Link} to="/home#Institution" className="d-flex align-items-center">
      <span>For Institution</span>
    </NavLink>
  </NavItem>
);

export const Individual = () => (
  <NavItem>
    <NavLink tag={Link} to="/home#Individual" className="d-flex align-items-center">
      <span>For Individuals</span>
    </NavLink>
  </NavItem>
);

export const Pricing = () => (
  <NavItem>
    <NavLink tag={Link} to="/home#Pricing" className="d-flex align-items-center">
      <span>Pricing</span>
    </NavLink>
  </NavItem>
);
export const Contact = () => (
  <NavItem>
    <NavLink tag={Link} to="/home#Contact" className="d-flex align-items-center">
      <span>Contact Us</span>
    </NavLink>
  </NavItem>
);
export const WalletConnect = () => (
  <NavItem>
    <NavLink tag={Link} to="/home/#WalletConnect" className="d-flex align-items-center">
      <span>Contact Us</span>
    </NavLink>
  </NavItem>
);
export const MintYourDID = () => (
  <NavItem>
    <NavLink tag={Link} to="/nft-mint/new" className="d-flex align-items-center">
      <span>Mint Your DID</span>
    </NavLink>
  </NavItem>
);
