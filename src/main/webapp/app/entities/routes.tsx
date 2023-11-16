import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import { ReducersMapObject, combineReducers } from '@reduxjs/toolkit';

import getStore from 'app/config/store';

import entitiesReducers from './reducers';

import NFTMint from './nft-mint';
import DidResolver from './did-resolver';
import Credentials from './credentials';
/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  const store = getStore();
  store.injectReducer('documint', combineReducers(entitiesReducers as ReducersMapObject));
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}
        <Route path="nft-mint/*" element={<NFTMint />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
        <Route path="did-resolve/*" element={<DidResolver />} />
        <Route path="credentials/*" element={<Credentials />} />
      </ErrorBoundaryRoutes>
    </div>
  );
};
