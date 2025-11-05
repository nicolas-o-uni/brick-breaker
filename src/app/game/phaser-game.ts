import Phaser from 'phaser';
import Scene1 from './scenes/scene1';
import Scene2 from './scenes/scene2';
import Scene3 from './scenes/scene3';
import Scene4 from './scenes/scene4';
import Scene5 from './scenes/scene5';
import finalRank from './scenes/finalRank';
import rankPrompt from './scenes/rankPrompt';

let gameInstance: Phaser.Game | null = null;

/* adicionar na seleção de fases pra definir qual mapa tá desbloqueado

  this.progress = await GameProgressService.loadProgress();

  if (this.progress.levelsCleared.includes('fase1')) {
    console.log("Fase 1 já concluída!");
  }
    
*/

// Funções gerais
export let isGameStarted = false;
export let isPaused = false;
export let isInMenu = false;
export let RankRun = false;

export function startLevel(balls: Phaser.Physics.Arcade.Group, launchBall: (ball: Phaser.Physics.Arcade.Image) => void, physics: Phaser.Physics.Arcade.ArcadePhysics, input: Phaser.Input.InputPlugin) {
  isGameStarted = false;
  isPaused = false;
  isInMenu = false;

  physics.pause();

  input.once('pointerdown', () => {
    if (!isGameStarted && !isPaused && !isInMenu) {
      physics.resume();
      balls.getChildren().forEach((b) => {
        const ball = b as Phaser.Physics.Arcade.Image;
        if (!ball || !ball.body) return;

        if (ball.body.velocity.x === 0 && ball.body.velocity.y === 0) {
          launchBall(ball);
          isGameStarted = true;
        }
      });
    }
  });
}

export function pause(physics: Phaser.Physics.Arcade.ArcadePhysics) {
  isPaused = true;
  physics.pause();
}

export function resume(physics: Phaser.Physics.Arcade.ArcadePhysics) {
  isPaused = false;
  physics.resume();
}

export function restartLevel(scene: Phaser.Scene) {
  scene.scene.restart();
}

export function nextLevel(scene: Phaser.Scene, target?: number | string) {
  const currentSceneKey = scene.scene.key;
  let nextMap: string;

  const validMaps = ['map1', 'map2', 'map3', 'map4', 'map5'];
  const match = currentSceneKey.match(/^map(\d+)$/);

  if (target) {
    nextMap = `map${target}`;
  } else if (match) {
    const nextNumber = parseInt(match[1]) + 1;
    nextMap = `map${nextNumber}`;
  } else {
    nextMap = 'principal';
  }

  // Normal flow (non-speedrun)
  if (!isRankRunEnabled()) {
    if (!validMaps.includes(nextMap)) nextMap = 'principal';
    if (nextMap === 'principal') {
      window.dispatchEvent(new CustomEvent('goToPage', { detail: 'principal' }));
    } else {
      scene.scene.stop(currentSceneKey);
      scene.scene.start(nextMap);
    }
    return;
  }

  // Speedrun flow
  if (!validMaps.includes(nextMap)) {
    // Finalizou todas as fases → cena de resumo (a ser criada)
    scene.scene.stop(currentSceneKey);
    scene.scene.start('finalRank');
  } else {
    RankRunData.currentIndex++;
    scene.scene.stop(currentSceneKey);
    scene.scene.start(nextMap);
  }
}

// Estado global do RankRun (não reatribua via import; use as funções abaixo)
export const RankRunState = {
  enabled: false,
  name: ""
};

// Dados coletados durante o RankRun
export const RankRunData: {
  currentIndex: number;
  totalTime: number;
  mapTimes: Record<string, number>;
} = {
  currentIndex: 1,
  totalTime: 0,
  mapTimes: {}
};

// Funções para controlar RankRun
export async function startRankRun() {
  RankRunState.enabled = false; // garante reset
  window.dispatchEvent(new CustomEvent('startRankPrompt'));
}

export function stopRankRun() {
  RankRunState.enabled = false;
}

// consulta
export function isRankRunEnabled() {
  return RankRunState.enabled;
}

export function resetRankRun() {
  RankRunState.enabled = false;
  RankRunState.name = "";
  RankRunData.currentIndex = 1;
  RankRunData.totalTime = 0;
  RankRunData.mapTimes = {};
}

export function CompleteMenu(physics: Phaser.Physics.Arcade.ArcadePhysics, scene: Phaser.Scene) {
  isGameStarted = false;
  isInMenu = true;
  physics.pause();
  
  const width = scene.cameras.main.width;
  const height = scene.cameras.main.height;

  function createButton(y: number, label: string, colorHex: string, callback: () => void) {
    const btnWidth = 260;
    const btnHeight = 55;
    const radius = 25;

    const btnKey = `btn_${label}_${colorHex}`;
    if (!scene.textures.exists(btnKey)) {
      const rt = scene.textures.createCanvas(btnKey, btnWidth, btnHeight);
      if (rt) {
        const ctx = rt.getContext();
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 0, btnHeight);
          grad.addColorStop(0, colorHex);
          grad.addColorStop(1, colorHex);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(btnWidth - radius, 0);
          ctx.quadraticCurveTo(btnWidth, 0, btnWidth, radius);
          ctx.lineTo(btnWidth, btnHeight - radius);
          ctx.quadraticCurveTo(btnWidth, btnHeight, btnWidth - radius, btnHeight);
          ctx.lineTo(radius, btnHeight);
          ctx.quadraticCurveTo(0, btnHeight, 0, btnHeight - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.fill();
          rt.refresh();
        }
      }
    }

    const btn = scene.add
      .image(width / 2, y, btnKey)
      .setDisplaySize(btnWidth, btnHeight)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });

    const text = scene.add
      .text(width / 2, y, label, {
        fontSize: "22px",
        fontFamily: "Verdana",
        color: "#ffffff",
        shadow: { offsetX: 0, offsetY: 0, color: "#000", blur: 5, fill: true },
      })
      .setOrigin(0.5)
      .setDepth(13);

    // Hover  
    btn.on("pointerover", () => {
      scene.tweens.add({
        targets: btn,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 180,
        ease: "Sine.easeOut",
      });
      btn.setTint(0xffffff);
    });

    btn.on("pointerout", () => {
      scene.tweens.add({
        targets: btn,
        scaleX: 1,
        scaleY: 1,
        duration: 180,
        ease: "Sine.easeOut",
      });
      btn.clearTint();
    });

    btn.on("pointerdown", () => {
      callback();
    });

    return { btn, text };
  }

  // Fundo 
  const overlay = scene.add
    .rectangle(0, 0, width, height, 0x000000, 0.75)
    .setOrigin(0)
    .setDepth(10)
    .setAlpha(0);

  scene.tweens.add({
    targets: overlay,
    alpha: 0.75,
    duration: 300,
    ease: "Sine.easeInOut",
  });

  // Caixa central 
  const texKey = "menuBoxGradient";
  if (!scene.textures.exists(texKey)) {
    const rt = scene.textures.createCanvas(texKey, 460, 360);
    if (rt) {
      const ctx = rt.getContext();
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, 360);
        grad.addColorStop(0, "#1a2a3a");
        grad.addColorStop(1, "#293e52");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 460, 360);
        rt.refresh();
      }
    }
  }

  const box = scene.add
    .image(width / 2, height / 2, texKey)
    .setDepth(11)
    .setAlpha(0)
    .setScale(0.8)
    .setDisplaySize(460, 360);

  const border = scene.add.graphics();
  border.lineStyle(3, 0x00ffff, 1);
  border.strokeRoundedRect(width / 2 - 230, height / 2 - 180, 460, 360, 25);
  border.setDepth(12).setAlpha(0);

  // Animação de aparição
  scene.tweens.add({
    targets: [box, border],
    alpha: 1,
    scale: 1,
    duration: 400,
    ease: "Back.Out",
  });

  // Título
  const title = scene.add
    .text(width / 2, height / 2 - 120, "Você venceu!", {
      fontSize: "40px",
      fontFamily: "Arial Black",
      color: "#ffffff",
      stroke: "#3700ffff",
      strokeThickness: 5,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: "#3700ffff",
        blur: 15,
        fill: true,
      },
    })
    .setOrigin(0.5)
    .setDepth(13);

  // Botão: Repetir fase
  const btnRetry = createButton(height / 2 - 40, "Repetir Fase", "#FF9900", () => {
    restartLevel(scene);
    cleanup();
  });

  // Botão: Continuar
  const btnNext = createButton(height / 2 + 30, "Próxima Fase", "#00BFFF", () => {
    nextLevel(scene);

    cleanup();
  });

  // Botão: Menu Principal
  const btnMenu = createButton(height / 2 + 100, "Menu Principal", "#FF4C4C", () => {
    window.dispatchEvent(new CustomEvent('goToPage', { detail: 'principal' }));
    cleanup();
  });

  // Remove todos os elementos do pop-up
  function cleanup() {
    overlay.destroy();
    box.destroy();
    border.destroy();
    title.destroy();
    [btnRetry, btnNext, btnMenu].forEach(({ btn, text }) => {
      btn.destroy();
      text.destroy();
    }); 
  }
}

export function createGame(): Phaser.Game {
  if (gameInstance) {
    return gameInstance;
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: 600,
    parent: 'game-container',
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false }
    },
    scene: [Scene1, Scene2, Scene3, Scene4, Scene5, finalRank, rankPrompt]
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