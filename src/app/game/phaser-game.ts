import Phaser from 'phaser';

let gameInstance: Phaser.Game | null = null;

// Funções gerais
export function startGame(scene: Phaser.Scene) {
  scene.physics.resume();
}

export function restartLevel(scene: Phaser.Scene) {
  scene.scene.restart();
}

export function nextLevel(scene: Phaser.Scene, nextSceneKey: string) {
  scene.scene.start(nextSceneKey);
}

export function CompleteMenu(scene: Phaser.Scene) {
  // exemplo com Angular/Ionic
  // se não tiver acesso ao router aqui, pode emitir evento para o Angular
  // ou usar uma callback passada da página
  console.log("Voltar para seleção de mapas");
}

export function destroyGame() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
}