import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

import { getColorByString } from '../util'
import { useAppDispatch, useAppSelector } from '../hooks'
import { MessageType, setFocused, setShowChat } from '../stores/ChatStore'

// Import the Draggable component from react-draggable
import Draggable from 'react-draggable'
import { Resizeable } from 'react-resizeable'
import { ShowChart } from '@mui/icons-material'

const Backdrop = styled.div<{ isMovable: boolean }>`
  position: fixed;
  bottom: 60px;
  left: 0;
  height: 400px;
  width: 500px;
  max-height: 50%;
  max-width: 100%;
  cursor: ${({ isMovable }) => (isMovable ? 'move' : 'unset')};
`

// const Backdrop = styled.div`
//   position: fixed;
//   bottom: 60px;
//   left: 0;
//   height: 400px;
//   width: 500px;
//   max-height: 50%;
//   max-width: 100%;
//   background-color: #333;
//   border-radius: 8px;
//   overflow: hidden;
//   transition: all 0.3s ease;
//   z-index: 1000;
//   cursor: move; /* Changes the cursor when dragging */
//   display: flex;
//   flex-direction: column;
//   box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
// `;

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
`

const FabWrapper = styled.div`
  margin-top: auto;
`

const ChatHeader = styled.div`
  position: relative;
  height: 35px;
  background: #000000a7;
  border-radius: 10px 10px 0px 0px;

  h3 {
    color: #fff;
    margin: 7px;
    font-size: 17px;
    text-align: center;
  }

  .close {
    position: absolute;
    top: 0;
    right: 0;
  }
`

const ChatBox = styled(Box)`
  height: 100%;
  width: 100%;
  overflow: auto;
  background: #2c2c2c;
  border: 1px solid #00000029;
`

const MessageWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0px 2px;

  p {
    margin: 3px;
    text-shadow: 0.3px 0.3px black;
    font-size: 15px;
    font-weight: bold;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  span {
    color: white;
    font-weight: normal;
  }

  .notification {
    color: grey;
    font-weight: normal;
  }

  :hover {
    background: #3a3a3a;
  }
`

const InputWrapper = styled.form`
  box-shadow: 10px 10px 10px #00000018;
  border: 1px solid #42eacb;
  border-radius: 0px 0px 10px 10px;
  display: flex;
  flex-direction: row;
  background: linear-gradient(180deg, #000000c1, #242424c0);
`

const InputTextField = styled(InputBase)`
  border-radius: 0px 0px 10px 10px;
  input {
    padding: 5px;
  }
`

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 54px;
  right: 16px;
`

const dateFormatter = new Intl.DateTimeFormat('en', {
  timeStyle: 'short',
  dateStyle: 'short',
})

const Message = ({ chatMessage, messageType }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  return (
    <MessageWrapper
      onMouseEnter={() => {
        setTooltipOpen(true)
      }}
      onMouseLeave={() => {
        setTooltipOpen(false)
      }}
    >
      <Tooltip
        open={tooltipOpen}
        title={dateFormatter.format(chatMessage.createdAt)}
        placement="right"
        arrow
      >
        {messageType === MessageType.REGULAR_MESSAGE ? (
          <p
            style={{
              color: getColorByString(chatMessage.author),
            }}
          >
            {chatMessage.author}: <span>{chatMessage.content}</span>
          </p>
        ) : (
          <p className="notification">
            {chatMessage.author} {chatMessage.content}
          </p>
        )}
      </Tooltip>
    </MessageWrapper>
  )
}

export default function Chat() {
  const [inputValue, setInputValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [readyToSubmit, setReadyToSubmit] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatMessages = useAppSelector((state) => state.chat.chatMessages)
  const focused = useAppSelector((state) => state.chat.focused)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const dispatch = useAppDispatch()
  const game = phaserGame.scene.keys.game as Game

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      inputRef.current?.blur()
      dispatch(setShowChat(false))
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!readyToSubmit) {
      setReadyToSubmit(true)
      return
    }
    inputRef.current?.blur()
    const val = inputValue.trim()
    setInputValue('')
    if (val) {
      game.network.addChatMessage(val)
      game.myPlayer.updateDialogBubble(val)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (focused) {
      inputRef.current?.focus()
    }
  }, [focused])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, showChat])

  return (
    <Resizeable>
      <Draggable bounds="parent" disabled = {!showChat} allowAnyClick = {false}>
        <Backdrop isMovable = {showChat}>
          <Wrapper>
            {showChat ? (
              <>
                <ChatHeader>
                  <h3>Chat</h3>
                  <IconButton
                    aria-label="close dialog"
                    className="close"
                    onClick={() => dispatch(setShowChat(false))}
                    size="small"
                  >
                    <CloseIcon />
                  </IconButton>
                </ChatHeader>
                <ChatBox>
                  {chatMessages.map(({ messageType, chatMessage }, index) => (
                    <Message chatMessage={chatMessage} messageType={messageType} key={index} />
                  ))}
                  <div ref={messagesEndRef} />
                  {showEmojiPicker && (
                    <EmojiPickerWrapper>
                      <Picker
                        theme="dark"
                        showSkinTones={false}
                        showPreview={false}
                        onSelect={(emoji) => {
                          setInputValue(inputValue + emoji.native)
                          setShowEmojiPicker(!showEmojiPicker)
                          dispatch(setFocused(true))
                        }}
                        exclude={['recent', 'flags']}
                      />
                    </EmojiPickerWrapper>
                  )}
                </ChatBox>
                <InputWrapper onSubmit={handleSubmit}>
                  <InputTextField
                    inputRef={inputRef}
                    autoFocus={focused}
                    fullWidth
                    placeholder="Press Enter to chat"
                    value={inputValue}
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                    inputProps={{ maxLength: 64 }}
                    onFocus={() => {
                      if (!focused) {
                        dispatch(setFocused(true))
                        setReadyToSubmit(true)
                      }
                    }}
                    onBlur={() => {
                      dispatch(setFocused(false))
                      setReadyToSubmit(false)
                    }}
                  />
                  <IconButton
                    aria-label="emoji"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <InsertEmoticonIcon />
                  </IconButton>
                </InputWrapper>
              </>
            ) : (
              <FabWrapper>
                <Fab
                  color="secondary"
                  aria-label="showChat"
                  size="small"
                  onClick={() => {
                    dispatch(setShowChat(true))
                    dispatch(setFocused(true))
                  }}
                >
                  <ChatBubbleOutlineIcon />
                </Fab>
              </FabWrapper>
            )}
          </Wrapper>
        </Backdrop>
      </Draggable>
    </Resizeable>
  )
}
