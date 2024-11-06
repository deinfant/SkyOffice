import phaserGame from '../PhaserGame';
import Game from '../scenes/Game';

export function processFile(file: File) {
    const gameInstance = phaserGame.scene.getScene('game') as Game
    console.log('Processing file:', file.name);
    const reader = new FileReader() // Create a FileReader to read the file content
    reader.onload = (e: ProgressEvent<FileReader>) => { // Arrow function here
      const result = e.target?.result;
      if (typeof result === 'string') {
        //try {
          const jsonContent = JSON.parse(result); // Parse the JSON content
          gameInstance.loadMapFromJSON(jsonContent);
          console.log("we goo!!!")
        //} catch (error) {
        //  console.error('Error parsing JSON file', error);
        //}
      } else {
        console.error('Content is not a valid string');
      }
    };
    reader.readAsText(file) // Read the file as text
  }