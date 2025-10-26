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