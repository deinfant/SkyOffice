import React, { useState } from 'react'
import styled from 'styled-components'
import { game } from '../PhaserGame'
import { tileImages } from '../globals'


// Styled Components
const InventoryWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 2px;
  width: 300px;
  max-height: 500px; /* Limit height */
  border: 2px solid #555;
  background: #2b2b2b;
  padding: 8px;
  border-radius: 8px;
  overflow-y: auto; /* Enable vertical scrolling */
  scrollbar-width: thin; /* Thin scrollbar for modern browsers */
  scrollbar-color: #888 #333; /* Scrollbar color (modern browsers) */
`

const Slot = styled.div<{ hasItem: boolean }>`
  width: 80px;
  height: 80px;
  background-color: ${({ hasItem }) => (hasItem ? '#444' : '#222')};
  border: 1px solid #555;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ItemIcon = styled.img`
  width: 90%;
  height: 90%;
  object-fit: fit;
`



const GAME = game();

export default function Inventory() {

  const [inventory, setInventory] = useState<{[key: number]: string}>(tileImages)
  
  
  
  return (
    <>

      <InventoryWrapper>
        {Object.entries(inventory).map(([key, value]) => {
          return (
            <Slot key={key} hasItem={!!value}>
              {key && <ItemIcon src= {value} />}
            </Slot>
          )
        })}
      </InventoryWrapper>
      
    </>
  )
}
