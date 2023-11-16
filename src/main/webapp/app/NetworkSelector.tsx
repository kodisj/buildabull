import React from 'react';
import { conf } from './shared/lib/config';
import { DropdownItem } from 'reactstrap';
import { NavDropdown } from './shared/layout/menus/menu-components';

interface NetworkSelectorProps {
  activeConf: number;
  selectNetwork(network: number);
}
export function NetworkSelector(props: NetworkSelectorProps) {
  const networks = ['No-Network'];
  conf.map((cfg, idx) => {
    networks.push(cfg.network);
  });
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [query, setQuery] = React.useState<string>('');
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  return (
    <NavDropdown icon="th-list" name={networks[activeIndex]} id="network-menu" style={{ maxHeight: '80vh', overflow: 'auto' }}>
      {networks.map((item, index) => (
        <div key={index}>
          <DropdownItem
            onClick={() => {
              props.selectNetwork(index);
              setActiveIndex(index);
            }}
            dropdownvalue={index}
          >
            {item}
          </DropdownItem>
        </div>
      ))}
    </NavDropdown>
  );
}
