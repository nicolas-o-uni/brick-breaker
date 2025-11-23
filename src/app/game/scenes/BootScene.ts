import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create() {
    // Pega a chave da cena alvo salva no Registry. Se não houver, vai para map1.
    const targetScene = this.registry.get('initialScene') || 'map1';
    
    console.log('BootScene redirecionando para:', targetScene);
    
    // Inicia a cena correta imediatamente
    this.scene.start(targetScene);
  }
}