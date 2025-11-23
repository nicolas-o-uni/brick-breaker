import Phaser from 'phaser';

export interface HUDInterface {
  headerBg: Phaser.GameObjects.Rectangle; // O fundo que terá colisão
  timerText: Phaser.GameObjects.Text;
  menuIcon: Phaser.GameObjects.Container; // Botão agrupado
}

export function createHUD(scene: Phaser.Scene, width: number, onMenuClick: () => void): HUDInterface {
  const hudHeight = 60; // Altura da barra
  const hudDepth = 100; // Camada superior

  // 1. Fundo Físico (Header Background)
  // Criamos um retângulo preto no topo
  const headerBg = scene.add.rectangle(width / 2, hudHeight / 2, width, hudHeight, 0x000000);
  headerBg.setStrokeStyle(1, 0x2323ff); // Borda azul neon
  headerBg.setDepth(hudDepth);

  // Habilita física no retângulo para colisão
  scene.physics.add.existing(headerBg, true); // 'true' = estático (não se move com o impacto)

  // 2. Botão de Menu (Canto Esquerdo)
  const btnContainer = scene.add.container(35, 30).setDepth(hudDepth + 1);
  const btnIcon = scene.add.text(0, 0, '☰', { fontSize: '22px', color: '#00ffff' }).setOrigin(0.5);
  
  // Área de clique
  const hitArea = new Phaser.Geom.Circle(0, 0, 20);
  btnContainer.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
  
  btnContainer.on('pointerdown', () => {
    onMenuClick();
  });

  btnContainer.add([btnIcon]);

  // 3. Texto do Timer (Centro)
  const timerText = scene.add.text(width / 2, 30, '00:00', {
    fontSize: '24px',
    fontFamily: 'Verdana',
    color: '#ffffff',
    stroke: '#0968bcff',
    strokeThickness: 3,
    shadow: { blur: 5, color: '#0968bcff', fill: true }
  }).setOrigin(0.5).setDepth(hudDepth + 1);

  return { headerBg, timerText, menuIcon: btnContainer };
}

export function createPauseMenu(
  scene: Phaser.Scene, 
  width: number, 
  height: number, 
  onResume: () => void, 
  onExit: () => void
): Phaser.GameObjects.Container {
  
  const menuContainer = scene.add.container(0, 0).setDepth(200).setVisible(false);

  // Overlay escuro
  const overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);
  overlay.setInteractive(); // Bloqueia cliques atrás

  // Título
  const title = scene.add.text(width / 2, height * 0.3, 'PAUSADO', {
    fontSize: '36px', fontFamily: 'Arial Black', color: '#00ffff',
    shadow: { blur: 15, color: '#00ffff', fill: true }
  }).setOrigin(0.5);

  // Helper interno para botões do menu
  const createBtn = (y: number, label: string, color: string, callback: () => void) => {
    const btnW = 220;
    const btnH = 50;
    const bg = scene.add.rectangle(width / 2, y, btnW, btnH, 0x111111)
      .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color)
      .setInteractive({ useHandCursor: true });
    
    const txt = scene.add.text(width / 2, y, label, { fontSize: '20px', fontFamily: 'Verdana', color: color }).setOrigin(0.5);
    
    bg.on('pointerover', () => bg.setFillStyle(0x333333));
    bg.on('pointerout', () => bg.setFillStyle(0x111111));
    bg.on('pointerdown', callback);
    
    return [bg, txt];
  };

  const resumeBtn = createBtn(height * 0.5, 'RETOMAR', '#00FF00', onResume);
  const exitBtn = createBtn(height * 0.65, 'SAIR', '#FF0055', onExit);

  menuContainer.add([overlay, title, ...resumeBtn, ...exitBtn]);

  return menuContainer;
}

export class PopupUI {
  static async showTextInput(scene: Phaser.Scene, title: string, message: string): Promise<string | null> {
    return new Promise((resolve) => {
      // Fundo escurecido
      const overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.5)
        .setOrigin(0)
        .setDepth(1000);

      // Container principal
      const boxWidth = 400;
      const boxHeight = 250;
      const box = scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2, boxWidth, boxHeight, 0x222244, 0.9)
        .setStrokeStyle(3, 0xffffff)
        .setDepth(1001);

      const titleText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 80, title, {
        fontSize: "24px",
        color: "#fff",
        fontFamily: "PressStart2P, monospace",
      }).setOrigin(0.5).setDepth(1001);

      const messageText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 40, message, {
        fontSize: "16px",
        color: "#ddd",
        fontFamily: "PressStart2P, monospace",
        wordWrap: { width: 360 },
        align: "center"
      }).setOrigin(0.5).setDepth(1001);

      // Cria input HTML sobre o canvas
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Digite seu nome...";
      input.style.position = "absolute";
      input.style.left = `${scene.scale.width / 2 - 150}px`;
      input.style.top = `${scene.scale.height / 2 + 10}px`;
      input.style.width = "300px";
      input.style.fontSize = "16px";
      input.style.padding = "8px";
      input.style.border = "2px solid white";
      input.style.background = "rgba(0,0,0,0.8)";
      input.style.color = "white";
      input.style.textAlign = "center";
      input.style.zIndex = "1002";
      document.body.appendChild(input);
      input.focus();

      // Botão confirmar
      const confirmBtn = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 + 80, "[ CONFIRMAR ]", {
        fontSize: "18px",
        color: "#00ff00",
        fontFamily: "PressStart2P, monospace",
      }).setOrigin(0.5).setDepth(1001)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          const value = input.value.trim();
          cleanup();
          resolve(value || null);
        });

      // Cancelar com ESC
      const escHandler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          cleanup();
          resolve(null);
        }
      };
      window.addEventListener("keydown", escHandler);

      // função pra limpar elementos
      function cleanup() {
        overlay.destroy();
        box.destroy();
        titleText.destroy();
        messageText.destroy();
        confirmBtn.destroy();
        input.remove();
        window.removeEventListener("keydown", escHandler);
      }
    });
  }

  static async showInfo(scene: Phaser.Scene, title: string, message: string): Promise<void> {
    return new Promise((resolve) => {
      const overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.5)
        .setOrigin(0).setDepth(1000);

      const box = scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2, 400, 220, 0x222244, 0.9)
        .setStrokeStyle(3, 0xffffff).setDepth(1001);

      const titleText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 70, title, {
        fontSize: "24px",
        color: "#fff",
        fontFamily: "PressStart2P, monospace",
      }).setOrigin(0.5).setDepth(1001);

      const messageText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 10, message, {
        fontSize: "14px",
        color: "#ccc",
        fontFamily: "PressStart2P, monospace",
        wordWrap: { width: 360 },
        align: "center",
      }).setOrigin(0.5).setDepth(1001);

      const okBtn = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 + 70, "[ ENTENDIDO ]", {
        fontSize: "18px",
        color: "#00ff00",
        fontFamily: "PressStart2P, monospace",
      }).setOrigin(0.5).setDepth(1001)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", cleanup);

      function cleanup() {
        overlay.destroy();
        box.destroy();
        titleText.destroy();
        messageText.destroy();
        okBtn.destroy();
        resolve();
      }
    });
  }
}