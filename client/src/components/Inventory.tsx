import React, { useState } from 'react'
import styled from 'styled-components'
import { game } from '../PhaserGame'
import { tileImages, editorInfomation } from '../globals'

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

//#45a049 (green)

const Slot = styled.div<{slotID}>`
  width: 80px;
  height: 80px;
  background-color: ${({slotID}) => ((slotID == editorInfomation.SelectedTileID) ? '#45a049 ' : '#222')};
  border: 1px solid #555;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.1s ease;

  &:hover {
    background-color: #ffffff;
    transform: scale(1.1);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
`

const ItemIcon = styled.img`
  width: 90%;
  height: 90%;
  object-fit: fit;
`

const GAME = game()

export default function Inventory() {
  const [inventory, setInventory] = useState<{ [key: number]: string }>(tileImages)
  const [, forceUpdate] = useState(0)
  return (
    <>
      <InventoryWrapper>
        {Object.entries(inventory).map(([key, value]) => {
          const slotID = Number(key)

          const handleClick = () => {
            editorInfomation.SelectedTileID = editorInfomation.SelectedTileID == slotID ? -1 : slotID
            forceUpdate((n) => n + 1);
            console.log(editorInfomation.SelectedTileID)
          }
          
          return (
            <Slot slotID = {slotID} onClick={handleClick}>
              {key && <ItemIcon src={value} />}
            </Slot>
          )
        })}
      </InventoryWrapper>
    </>
  )
}
