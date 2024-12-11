import phaserGame , {game} from '../PhaserGame'
import Game from '../scenes/Game'
import { tilePlaceHash, TilePlaceLogTemplate } from '../globals'

export function downloadFile(type: String) {
  if (type == 'Map') {
    let tilePlaceLog: TilePlaceLogTemplate[] = []

    Object.keys(tilePlaceHash).forEach((x) => {
      const xPos = Number(x) // Convert x to number

      // Loop through the second level of keys (y positions)
      Object.keys(tilePlaceHash[xPos]).forEach((y) => {
        const yPos = Number(y) // Convert y to number
        const positionInfo = tilePlaceHash[xPos][yPos]
        tilePlaceLog.push({ id: positionInfo.id, x: xPos, y: yPos, collide: positionInfo.collide })
      })
    })

    let jsonString = JSON.stringify(tilePlaceLog)

    // You could then save it to a file on the client side (e.g., via Blob or FileSaver.js)
    let blob = new Blob([jsonString], { type: 'application/json' })
    let link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'modifiedMap.json'
    link.click()
  }
}
interface a {
  locations: {}
  information: {}
}

interface b {
  [id: number]: a
}
let m : b;
m = {1: {locations: {}, information: {}} as a}



export function processFile(file: File, type: String) {
  // const gameInstance = phaserGame.scene.getScene('game') as Game
  const gameInstance = game();
  console.log('Processing file:', file.name)

  const readJSONFile = () => {
    const reader = new FileReader() // Create a FileReader to read the file content
    reader.onload = (e: ProgressEvent<FileReader>) => {
      // Arrow function here
      const result = e.target?.result
      console.log(result)
      if (typeof result === 'string') {
        const jsonContent = JSON.parse(result) // Parse the JSON content
        gameInstance.loadMapFromJSON(jsonContent)
        console.log('we goo!!!')
      } else {
        console.error('Content is not a valid file')
      }
    }
    reader.readAsText(file) // Read the file as text
  }

  const readImageFile = () => {
    const reader = new FileReader() // Create a FileReader to read the file content
    reader.onload = (e: ProgressEvent<FileReader>) => {
      // Arrow function here
      const imageSrc = e.target?.result as string
      const uuid = crypto.randomUUID()
      gameInstance.textures.addBase64(uuid, imageSrc).once(Phaser.Textures.Events.LOAD, () => {
        const tileX = gameInstance.myPlayer.body.x
        const tileY = gameInstance.myPlayer.body.y
        const tileWidth = 32
        const tileHeight = 32

        const sprite = gameInstance.add
          .sprite(Math.floor(tileX / 32) * 32, Math.floor(tileY / 32) * 32, uuid)
          .setOrigin(0, 0)

        sprite.setDisplaySize(tileWidth, tileHeight)
      })
    }
    reader.readAsDataURL(file) // Read the image as a Data URL (base64)
  }

  /////////////////time to ohhhhhhhh ohhhhh////////////////////////////////////////////////

  const fileType = file.type
  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  // Check if it's a JSON file
  if (fileExtension === 'json' || fileType === 'application/json') {
    readJSONFile()
  } else if (fileType.startsWith('image/')) {
    readImageFile()
  } else {
    alert('Unsupported file type')
  }
}
