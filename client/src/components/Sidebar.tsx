import React, { useState } from 'react';
import styled from 'styled-components';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Inventory from './Inventory';
// Define a type for the SidebarWrapper's props to accept 'isOpen' as a boolean

const width = 250

const SidebarWrapper = styled.div<{isOpen: boolean}>`
  position: fixed;
  top: 0;
  right: ${(props) => (props.isOpen ? '0' : '-350px')};
  height: 100%;
  width: 350px;
  background-color: #333;
  color: white;
  transition: right 0.3s ease;
  z-index: 1000;
`;

const SidebarContent = styled.div`
  padding: 20px;
`;

const SidebarToggleButton = styled.div`
  position: fixed;
  top: 50%;
  right: 0;
  width: 30px;
  height: 60px;
  background-color: #333;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1001;
  transition: right 0.3s ease;

  &:hover {
    background-color: #444;
  }
`;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Sidebar */}
      <SidebarWrapper isOpen={isOpen}>
        <SidebarContent>
          <h2>Sidebar</h2>
          <h2>u r so skibidi!!!</h2>
          <h2>Items</h2>
          <Inventory/>
        </SidebarContent>
      </SidebarWrapper>

      {/* Sidebar Toggle Button */}
      <SidebarToggleButton onClick={toggleSidebar}>
        {isOpen ? <ArrowForwardIcon /> : <ArrowBackIcon />}
      </SidebarToggleButton>
    </>
  );
};

export default Sidebar;
