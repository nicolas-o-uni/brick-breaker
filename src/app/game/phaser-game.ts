import Phaser from 'phaser';
import MainScene from './scenes/main-scene';

let gameInstance: Phaser.Game | null = null;

export function startGame(parentId = 'game-container'): Phaser.Game {
  if (gameInstance) return gameInstance;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: parentId,
      width: 800,
      height: 600
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false }
    },
    scene: [MainScene]
  };

  gameInstance = new Phaser.Game(config);
  return gameInstance;
}

export function destroyGame() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
}