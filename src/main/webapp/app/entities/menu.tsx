import React from 'react';

import MenuItem from 'app/shared/layout/menus/menu-item';

const EntitiesMenu = () => {
  return (
    <>
      {/* prettier-ignore */}
      <MenuItem icon="asterisk" to="/nft-mint/new">
        NFT Mint
      </MenuItem>
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
      <MenuItem icon="asterisk" to="/did-resolve">
        Resolve DID
      </MenuItem>
      <MenuItem icon="asterisk" to="/credentials">
        Credentials
      </MenuItem>
    </>
  );
};

export default EntitiesMenu;
