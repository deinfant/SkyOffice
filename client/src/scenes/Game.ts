import Phaser from 'phaser'

// import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'

import Item from '../items/Item'
import Chair from '../items/Chair'
import Computer from '../items/Computer'
import Whiteboard from '../items/Whiteboard'
import VendingMachine from '../items/VendingMachine'
import '../characters/MyPlayer'
import '../characters/OtherPlayer'
import MyPlayer from '../characters/MyPlayer'
import OtherPlayer from '../characters/OtherPlayer'
import PlayerSelector from '../characters/PlayerSelector'
import Network from '../services/Network'
import { IPlayer } from '../../../types/IOfficeState'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import { ItemType } from '../../../types/Items'
import store from '../stores'
import { setFocused, setShowChat } from '../stores/ChatStore'
import { NavKeys, Keyboard } from '../../../types/KeyboardState'
import { tilePlaceHash, TilePlaceLogTemplate, tileImages } from '../globals'
import { phaserEvents, Event } from '../events/EventCenter'
import { Clock } from 'colyseus'
import { Console, log } from 'console'
import { rejects } from 'assert'
import { resourceUsage } from 'process'
const vector2 = Phaser.Math.Vector2

var keys = new Map<string, Phaser.Input.Keyboard.Key>()
keys['E'] = Phaser.Input.Keyboard.Key
keys['R'] = Phaser.Input.Keyboard.Key
keys['Q'] = Phaser.Input.Keyboard.Key

interface TilePlacePositionTemplate {
  id: number
  collide: boolean
}

export default class Game extends Phaser.Scene {
  network!: Network
  private cursors!: NavKeys
  public map!: Phaser.Tilemaps.Tilemap
  myPlayer!: MyPlayer
  private playerSelector!: Phaser.GameObjects.Zone
  private otherPlayers!: Phaser.Physics.Arcade.Group
  private otherPlayerMap = new Map<string, OtherPlayer>()
  computerMap = new Map<string, Computer>()
  private whiteboardMap = new Map<string, Whiteboard>()

  acceleration = new Phaser.Math.Vector2()

  constructor() {
    super('game')
  }

  registerKeys() {
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys('W,S,A,D') as Keyboard),
    }

    // maybe we can have a dedicated method for adding keys if more keys are needed in the future

    for (const key in keys) {
      keys[key] = this.input.keyboard.addKey(key)
      console.log('NIGA NIGA NIGA')
      console.log(keys[key])
    }

    this.input.keyboard.disableGlobalCapture()
    this.input.keyboard.on('keydown-ENTER', (event) => {
      store.dispatch(setShowChat(true))
      store.dispatch(setFocused(true))
      this.input.keyboard.resetKeys() // prevent player keep moving after pressing enter while holding movement keys
    })
    this.input.keyboard.on('keydown-ESC', (event) => {
      store.dispatch(setShowChat(false))
    })
  }

  disableKeys() {
    this.input.keyboard.enabled = false
  }

  enableKeys() {
    this.input.keyboard.enabled = true
  }

  create(data: { network: Network }) {
    if (!data.network) {
      throw new Error('server instance missing')
    } else {
      this.network = data.network
    }

    createCharacterAnims(this.anims)

    this.map = this.make.tilemap({ key: 'tilemap' })
    const FloorAndGround = this.map.addTilesetImage('FloorAndGround', 'tiles_wall')

    const groundLayer = this.map.createLayer('Ground', FloorAndGround)
    groundLayer.setCollisionByProperty({ collides: true })

    // debugDraw(groundLayer, this)

    this.myPlayer = this.add.myPlayer(705, 500, 'adam', this.network.mySessionId)
    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16)

    //fart shut up

    // window.onclick = () => {
    //   window.onclick = () => {
    //     const pointer = this.input.activePointer
    //     this.acceleration.add(this.myPlayer.body.velocity.multiply(new Phaser.Math.Vector2(20, 20)))
    //   }
    // }

    /////dash above, its useles

    /////////////////////////

    this.map.layers.forEach((layerData) => {
      const layer = layerData.tilemapLayer
      if (layer) {
        const tileset = FloorAndGround
        const tileWidth = tileset.tileWidth
        const tileHeight = tileset.tileHeight
        const sourceImage = tileset.image.getSourceImage()
        console.log(tileset.firstgid)
        const canvas = document.createElement('canvas')
        // canvas.width = sourceImage.width
        canvas.width = tileset.tileWidth
        // canvas.height = sourceImage.height
        canvas.height = tileset.tileHeight
        const context = canvas.getContext('2d')
        if (context) context.imageSmoothingEnabled = false
        if (sourceImage instanceof HTMLImageElement || sourceImage instanceof HTMLCanvasElement) {
          let counter = 0
          const loopedIndex: number[] = []
          layer.forEachTile((tile) => {
            if (context !== undefined && tile.index > 0 && !loopedIndex.includes(tile.index)) {
              loopedIndex.push(tile.index)
              setTimeout(() => {
                const tileX = (tile.index % tileset.rows)
                const tileY = Math.floor(tile.index / tileset.columns)
                context!.drawImage(
                  sourceImage,
                  tileX * tileWidth,
                  tileY * tileHeight,
                  tileWidth,
                  tileHeight,
                  2.5,
                  2.5,
                  tileWidth-5,
                  tileHeight-5,
                )
//                 const index = 29
//                 const tileX = (index % tileset.columns)
//                 const tileY = Math.floor(index / tileset.rows)
// console.log(tileset.columns)

//                 context!.drawImage(
//                   sourceImage,
//                   tileX * tileWidth,
//                   tileY * tileHeight,
//                   tileWidth,
//                   tileHeight,
//                   2.5,
//                   2.5,
//                   tileWidth - 5,
//                   tileHeight - 5
//                 )

                const base64String = canvas.toDataURL()
                tileImages[tile.index] = base64String
                // console.log(base64String)
              }, counter++ * 10)
            }
          })
        }
      }
    })

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase()
      if (key == 't') {
        const x = Math.round(this.myPlayer.x)
        const y = Math.round(this.myPlayer.y)
        const tileID = 29
        const collide = false

        this.network.placeNewTile(tileID, x, y, collide)

        if (!tilePlaceHash[x]) {
          tilePlaceHash[x] = {}
        }
        tilePlaceHash[x][y] = { id: tileID, collide: collide }
      }
    })

    // import chair objects from Tiled map to Phaser
    const chairs = this.physics.add.staticGroup({ classType: Chair })
    const chairLayer = this.map.getObjectLayer('Chair')
    chairLayer.objects.forEach((chairObj) => {
      const item = this.addObjectFromTiled(chairs, chairObj, 'chairs', 'chair') as Chair
      // custom properties[0] is the object direction specified in Tiled
      item.itemDirection = chairObj.properties[0].value
    })

    // import computers objects from Tiled map to Phaser
    const computers = this.physics.add.staticGroup({ classType: Computer })
    const computerLayer = this.map.getObjectLayer('Computer')
    computerLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(computers, obj, 'computers', 'computer') as Computer
      item.setDepth(item.y + item.height * 0.27)
      const id = `${i}`
      item.id = id
      this.computerMap.set(id, item)
    })

    // import whiteboards objects from Tiled map to Phaser
    const whiteboards = this.physics.add.staticGroup({ classType: Whiteboard })
    const whiteboardLayer = this.map.getObjectLayer('Whiteboard')
    whiteboardLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(
        whiteboards,
        obj,
        'whiteboards',
        'whiteboard'
      ) as Whiteboard
      const id = `${i}`
      item.id = id
      this.whiteboardMap.set(id, item)
    })

    // import vending machine objects from Tiled map to Phaser
    const vendingMachines = this.physics.add.staticGroup({ classType: VendingMachine })
    const vendingMachineLayer = this.map.getObjectLayer('VendingMachine')
    vendingMachineLayer.objects.forEach((obj, i) => {
      this.addObjectFromTiled(vendingMachines, obj, 'vendingmachines', 'vendingmachine')
    })

    // import other objects from Tiled map to Phaser
    this.addGroupFromTiled('Wall', 'tiles_wall', 'FloorAndGround', false)
    this.addGroupFromTiled('Objects', 'office', 'Modern_Office_Black_Shadow', false)
    this.addGroupFromTiled('ObjectsOnCollide', 'office', 'Modern_Office_Black_Shadow', true)
    this.addGroupFromTiled('GenericObjects', 'generic', 'Generic', false)
    this.addGroupFromTiled('GenericObjectsOnCollide', 'generic', 'Generic', true)
    this.addGroupFromTiled('Basement', 'basement', 'Basement', true)

    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    this.cameras.main.zoom = 1.5
    this.cameras.main.startFollow(this.myPlayer, true)

    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], groundLayer)
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], vendingMachines)

    this.physics.add.overlap(
      this.playerSelector,
      [chairs, computers, whiteboards, vendingMachines],
      this.handleItemSelectorOverlap,
      undefined,
      this
    )

    this.physics.add.overlap(
      this.myPlayer,
      this.otherPlayers,
      this.handlePlayersOverlap,
      undefined,
      this
    )

    // register network event listeners
    this.network.onPlayerJoined(this.handlePlayerJoined, this)
    this.network.onPlayerLeft(this.handlePlayerLeft, this)
    this.network.onMyPlayerReady(this.handleMyPlayerReady, this)
    this.network.onMyPlayerVideoConnected(this.handleMyVideoConnected, this)
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this)
    this.network.onItemUserAdded(this.handleItemUserAdded, this)
    this.network.onItemUserRemoved(this.handleItemUserRemoved, this)
    this.network.onChatMessageAdded(this.handleChatMessageAdded, this)
    this.network.onNewTilePlaced(this.handleTilePlacement, this)
  }

  private handleItemSelectorOverlap(playerSelector, selectionItem) {
    const currentItem = playerSelector.selectedItem as Item
    // currentItem is undefined if nothing was perviously selected
    if (currentItem) {
      // if the selection has not changed, do nothing
      if (currentItem === selectionItem || currentItem.depth >= selectionItem.depth) {
        return
      }
      // if selection changes, clear pervious dialog
      if (this.myPlayer.playerBehavior !== PlayerBehavior.SITTING) currentItem.clearDialogBox()
    }

    // set selected item and set up new dialog
    playerSelector.selectedItem = selectionItem
    selectionItem.onOverlapDialog()
  }

  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ) {
    const actualX = object.x! + object.width! * 0.5
    const actualY = object.y! - object.height! * 0.5
    const obj = group
      .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
      .setDepth(actualY)
    return obj
  }

  private addGroupFromTiled(
    objectLayerName: string,
    key: string,
    tilesetName: string,
    collidable: boolean
  ) {
    const group = this.physics.add.staticGroup()
    const objectLayer = this.map.getObjectLayer(objectLayerName)
    objectLayer.objects.forEach((object) => {
      const actualX = object.x! + object.width! * 0.5
      const actualY = object.y! - object.height! * 0.5
      group
        .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
        .setDepth(actualY)
    })
    if (this.myPlayer && collidable)
      this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], group)
  }

  // function to add new player to the otherPlayer group
  private handlePlayerJoined(newPlayer: IPlayer, id: string) {
    if (id === this.myPlayer.playerId) return
    if (this.otherPlayerMap.has(id)) return

    const otherPlayer = this.add.otherPlayer(newPlayer.x, newPlayer.y, 'adam', id, newPlayer.name)

    this.otherPlayers.add(otherPlayer)
    this.otherPlayerMap.set(id, otherPlayer)
  }

  // function to remove the player who left from the otherPlayer group
  private handlePlayerLeft(id: string) {
    if (this.otherPlayerMap.has(id)) {
      const otherPlayer = this.otherPlayerMap.get(id)
      if (!otherPlayer) return
      this.otherPlayers.remove(otherPlayer, true, true)
      this.otherPlayerMap.delete(id)
    }
  }

  private handleMyPlayerReady() {
    this.myPlayer.readyToConnect = true
  }

  private handleMyVideoConnected() {
    this.myPlayer.videoConnected = true
  }

  // function to update target position upon receiving player updates
  private handlePlayerUpdated(field: string, value: number | string, id: string) {
    const otherPlayer = this.otherPlayerMap.get(id)
    otherPlayer?.updateOtherPlayer(field, value)
  }

  private handlePlayersOverlap(myPlayer, otherPlayer) {
    otherPlayer.makeCall(myPlayer, this.network?.webRTC)
  }

  private handleItemUserAdded(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.addCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.addCurrentUser(playerId)
    }
  }

  private handleItemUserRemoved(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.removeCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.removeCurrentUser(playerId)
    }
  }

  private handleChatMessageAdded(playerId: string, content: string) {
    const otherPlayer = this.otherPlayerMap.get(playerId)
    otherPlayer?.updateDialogBubble(content)
  }

  private handleTilePlacement(playerId: string, content: any) {
    console.log(content)
    const newtile = this.map.putTileAtWorldXY(content.tile, content.worldX, content.worldY, true)
    if (content.canCollide) {
      newtile.setCollision(true, true, true, true, true)
    }
  }

  public loadMapFromJSON(jsonContent: any) {
    jsonContent.forEach((tileSettings) => {
      this.network.placeNewTile(
        tileSettings.id,
        tileSettings.x,
        tileSettings.y,
        tileSettings.collide
      )
    })
  }

  ///////////UPDATE FUNCTION HOLY SHIT HOLY SHIT UPDATE FUNCTION?? IMPOSSIBLE//////////////////////////////

  update(t: number, dt: number) {
    if (this.myPlayer && this.network) {
      this.playerSelector.update(this.myPlayer, this.cursors)
      this.myPlayer.update(this.playerSelector, this.cursors, keys, this.network)
      this.acceleration.multiply(new Phaser.Math.Vector2(0.7, 0.7))
      const newVelocity = this.myPlayer.body.velocity.add(this.acceleration)
      this.myPlayer.setVelocity(newVelocity.x, newVelocity.y)
    }
  }
}
