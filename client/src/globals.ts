export interface TilePlaceLogTemplate {
    id: number;
    x: number;
    y: number;
    collide: boolean;
  }
  
  
  
  
  interface TilePlacePositionTemplate {
    id: number;
    collide: boolean;
  }
  
  export const tilePlaceHash: { [key: number]: { [key: number]: TilePlacePositionTemplate}} = {};





  export const tileImages = {};