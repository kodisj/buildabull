import './home.scss';

import React from 'react';
import { Link } from 'react-router-dom';

import { Row, Col, Alert } from 'reactstrap';

import { useAppSelector } from 'app/config/store';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);

  return (
    <Row>
      <Col md="3" className="pad">
        <span className="hipster rounded" />
      </Col>
      <Col md="9">
        <h2>Welcome to build a bull hackathon demo of AlgoDID-NFT.</h2>
        <p className="lead">Anchor billions of decentralized identity on Algorand, to issue and verify verifiable credentials</p>
        <p></p>

        <ul>
          <li>
          Team consists of ex Qualcomm and Fidelity engineers having 20+ years of experience in software and 2+ years of experience in block chain and Algorand.  Total head count is 4 so far.

          </li>
          <li>
          Summary: Algo-DID is the compelling product that is being built to serve the decentralized identity market and attract more market share into the Algorand chain because of greater tech and affordability when compared to other chains. Team is already excited about this opportunity and started developing carrier grade and scalable product and requires mentoring, guidance and funding to accelerate the development and take it to the market soon.

          </li>
        </ul>

        <p>
            Submitted by Kodiswaran Babu Janardhanan (kodisj@gmail.com) and Thanuja K Ramiya (thanuja_kodis@yahoo.com)
        </p>
      </Col>
    </Row>
  );
};

export default Home;
