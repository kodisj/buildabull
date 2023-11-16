import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import NFTMint from './nft-mint';
import NFTMintDetail from './nft-mint-detail';
import NFTMintUpdate from './nft-mint-update';
import NFTMintDeleteDialog from './nft-mint-delete-dialog';

const NFTMintRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<NFTMint />} />
    <Route path="new" element={<NFTMintUpdate />} />
    <Route path=":id">
      <Route index element={<NFTMintDetail />} />
      <Route path="edit" element={<NFTMintUpdate />} />
      <Route path="delete" element={<NFTMintDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default NFTMintRoutes;
