import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col,NavLink } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './nft-mint.reducer';
import { AnyAction } from 'redux';
import { reset } from './algorandMint';


export const NFTMintDetail = (params:any) => {
  const dispatch = useAppDispatch();
  const did = useAppSelector(state => state.algorandMint.did);
  const didLink = useAppSelector(state => state.algorandMint.didLink);
  const tokenId = useAppSelector(state => state.algorandMint.tokenId);


  return (
    <Row>
      <Col md="8">
        <h2 data-cy="nFTMintDetailsHeading">Congratulations!!! </h2>
        <h2 data-cy="nFTMintDetailsHeading">You have successfully minted your DID. </h2>
        <br></br>
        <h3 data-cy="nFTMintDetailsHeading">DID Details... </h3>
        <br></br>
        <div data-cy="nFTMintDetailsHeading">Your DID is: did:algo-nft:{tokenId} </div>
        <br></br>
        <div>Our AlgoDID resolver will resolve the above DID into DID document, we are working on this to integrate into the DID universal resolver</div>
        <br></br>
        <div data-cy="nFTMintDetailsHeading">Your AlgoDID NFT token ID is:  {tokenId} </div>
        <div>You can safely store your DID as NFT in your algorand wallet</div>
        <br></br>
        <div>Your Token Info: <NavLink>https://testnet.algoexplorer.io/asset/{tokenId}</NavLink> </div>
        <br></br>
        <div data-cy="nFTMintDetailsHeading">DID link:  <NavLink>{didLink}</NavLink> </div>
        <br></br>
        <div data-cy="nFTMintDetailsHeading">Actual DID: </div>
        <br></br>
        <pre>{did}</pre>
        
        

        {/* <Button tag={Link} to="/nft-mint" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/nft-mint/${nFTMintEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button> */}
      </Col>
    </Row>
  );
};

export default NFTMintDetail;
