import Phaser from 'phaser'
import Player from './Player'
import MyPlayer from './MyPlayer'
import { sittingShiftData } from './Player'
import WebRTC from '../web/WebRTC'
import { Event, phaserEvents } from '../events/EventCenter'
import { Vector } from 'matter'

function normalizeToMagnitude(x, y, targetMagnitude) {
  // Step 1: Calculate the original magnitude of the vector
  const magnitude = Math.sqrt(x * x + y * y)

  // Step 2: Calculate the scaling factor
  const scale = magnitude > 0 ? targetMagnitude / magnitude : 0

  // Step 3: Scale the vector components
  const newX = x * scale
  const newY = y * scale

  return { x: newX, y: newY }
}

export default class OtherPlayer extends Player {
  private targetPosition: [number, number]
  private lastUpdateTimestamp?: number
  private connectionBufferTime = 0
  private connected = false
  private playContainerBody: Phaser.Physics.Arcade.Body
  private myPlayer?: MyPlayer

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, id, frame)
    this.targetPosition = [x, y]

    this.playerName.setText(name)
    this.playContainerBody = this.playerContainer.body as Phaser.Physics.Arcade.Body
  }

  makeCall(myPlayer: MyPlayer, webRTC: WebRTC) {
    this.myPlayer = myPlayer
    const myPlayerId = myPlayer.playerId
    if (
      !this.connected &&
      this.connectionBufferTime >= 750 &&
      myPlayer.readyToConnect &&
      this.readyToConnect &&
      myPlayer.videoConnected &&
      myPlayerId > this.playerId
    ) {
      webRTC.connectToNewUser(this.playerId)
      this.connected = true
      this.connectionBufferTime = 0
    }
  }

  updateOtherPlayer(field: string, value: number | string | boolean) {
    switch (field) {
      case 'name':
        if (typeof value === 'string') {
          this.playerName.setText(value)
        }
        break

      case 'x':
        if (typeof value === 'number') {
          this.targetPosition[0] = value
        }
        break

      case 'y':
        if (typeof value === 'number') {
          this.targetPosition[1] = value
        }
        break

      case 'anim':
        if (typeof value === 'string') {
          this.anims.play(value, true)
        }
        break

      case 'readyToConnect':
        if (typeof value === 'boolean') {
          this.readyToConnect = value
        }
        break

      case 'videoConnected':
        if (typeof value === 'boolean') {
          this.videoConnected = value
        }
        break
    }
  }

  destroy(fromScene?: boolean) {
    this.playerContainer.destroy()

    super.destroy(fromScene)
  }

  /** preUpdate is called every frame for every game object. */

  preUpdate(t: number, dt: number) {
    super.preUpdate(t, dt)

    // // if Phaser has not updated the canvas (when the game tab is not active) for more than 1 sec
    // // directly snap player to their current locations
    // if (this.lastUpdateTimestamp && t - this.lastUpdateTimestamp > 750) {
    //   this.lastUpdateTimestamp = t
    //   this.x = this.targetPosition[0]
    //   this.y = this.targetPosition[1]
    //   this.playerContainer.x = this.targetPosition[0]
    //   this.playerContainer.y = this.targetPosition[1] - 30
    //   return
    // }

    this.lastUpdateTimestamp = t
    this.setDepth(this.y) // change player.depth based on player.y
    const animParts = this.anims.currentAnim.key.split('_')
    const animState = animParts[1]
    if (animState === 'sit') {
      const animDir = animParts[2]
      const sittingShift = sittingShiftData[animDir]
      if (sittingShift) {
        // set hardcoded depth (differs between directions) if player sits down
        this.setDepth(this.depth + sittingShiftData[animDir][2])
      }
    }

    {
      const speed = 200 // speed is in unit of pixels per second
      const delta = ((speed + 10) / 1000) * dt
      let dx = this.targetPosition[0] - this.x
      let dy = this.targetPosition[1] - this.y
      const maxRange = delta * 20
console.log(Math.abs(dy))
      if (Math.abs(dx) < delta || Math.abs(dx) > maxRange) {
        this.x = this.targetPosition[0]
        dx = 0
      }
      if (Math.abs(dy) < delta || Math.abs(dy) > maxRange) {
        this.y = this.targetPosition[1]
        dy = 0
      }

      const newXY = normalizeToMagnitude(dx, dy, speed)
      // update character velocity
      this.setVelocity(newXY.x, newXY.y)

      this.playerContainer.x = this.x
      this.playerContainer.y = this.y - 30
    }

    // while currently connected with myPlayer
    // if myPlayer and the otherPlayer stop overlapping, delete video stream
    this.connectionBufferTime += dt
    if (
      this.connected &&
      !this.body.embedded &&
      this.body.touching.none &&
      this.connectionBufferTime >= 750
    ) {
      if (this.x < 610 && this.y > 515 && this.myPlayer!.x < 610 && this.myPlayer!.y > 515) return
      phaserEvents.emit(Event.PLAYER_DISCONNECTED, this.playerId)
      this.connectionBufferTime = 0
      this.connected = false
    }
  }
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      otherPlayer(
        x: number,
        y: number,
        texture: string,
        id: string,
        name: string,
        frame?: string | number
      ): OtherPlayer
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'otherPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    id: string,
    name: string,
    frame?: string | number
  ) {
    const sprite = new OtherPlayer(this.scene, x, y, texture, id, name, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    const collisionScale = [6, 4]
    sprite.body
      .setSize(sprite.width * collisionScale[0], sprite.height * collisionScale[1])
      .setOffset(
        sprite.width * (1 - collisionScale[0]) * 0.5,
        sprite.height * (1 - collisionScale[1]) * 0.5 + 17
      )

    return sprite
  }
)
