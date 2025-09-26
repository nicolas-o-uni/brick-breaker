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
  const width = scene.cameras.main.width;
  const height = scene.cameras.main.height;

  // Fundo semi-transparente (overlay)
  const overlay = scene.add
    .rectangle(0, 0, width, height, 0x000000, 0.5)
    .setOrigin(0)
    .setDepth(10); // fica na frente de tudo

  // Caixa do menu
  const box = scene.add
    .rectangle(width / 2, height / 2, 400, 300, 0x222222, 0.9)
    .setStrokeStyle(2, 0xffffff)
    .setDepth(11);

  // Título
  const title = scene.add
    .text(width / 2, height / 2 - 100, 'Fase Completa!', {
      fontSize: '32px',
      color: '#ffffff',
    })
    .setOrigin(0.5)
    .setDepth(11);

  // Botão: Repetir fase
  const btnRetry = scene.add
    .text(width / 2, height / 2 - 30, ' Repetir Fase', {
      fontSize: '24px',
      color: '#00ff00',
    })
    .setOrigin(0.5)
    .setInteractive()
    .setDepth(11);

  btnRetry.on('pointerdown', () => {
    scene.scene.restart(); // Reinicia a cena atual
    cleanup();
  });

  // Botão: Continuar
  const btnNext = scene.add
    .text(width / 2, height / 2 + 20, ' Próxima Fase', {
      fontSize: '24px',
      color: '#00ffff',
    })
    .setOrigin(0.5)
    .setInteractive()
    .setDepth(11);

  btnNext.on('pointerdown', () => {
    const currentSceneKey = scene.scene.key;

    // pega número da fase atual pelo nome da cena
    const match = currentSceneKey.match(/^map(\d+)$/);

    if (match) {
      const currentMapNumber = parseInt(match[1]);
      const nextMapNumber = currentMapNumber + 1;

      // Salva a fase atual no registry
      scene.registry.set('faseAtual', nextMapNumber);

      // também pode salvar no localStorage (se quiser persistir entre sessões)
      localStorage.setItem('faseAtual', nextMapNumber.toString());

      const nextMapKey = `map${nextMapNumber}`;
      if (scene.scene.get(nextMapKey)) {
        scene.scene.start(nextMapKey);
      } else {
        scene.scene.start('MainMenu');
      }
    }

    cleanup();
  });


  // Botão: Menu Principal
  const btnMenu = scene.add
    .text(width / 2, height / 2 + 70, 'Menu Principal', {
      fontSize: '24px',
      color: '#ff6666',
    })
    .setOrigin(0.5)
    .setInteractive()
    .setDepth(11);

  btnMenu.on('pointerdown', () => {
    scene.scene.start('MainMenu'); // Troque pelo nome da cena de menu
    cleanup();
  });

  // Remove todos os elementos do pop-up
  function cleanup() {
    overlay.destroy();
    box.destroy();
    title.destroy();
    btnRetry.destroy();
    btnNext.destroy();
    btnMenu.destroy();
  }
}

export function destroyGame() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
}