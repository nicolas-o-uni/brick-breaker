// game/scenes/rankPrompt.ts
import Phaser from "phaser";
import { PopupUI } from "../visual";
import { RankRunState, RankRunData } from "../phaser-game";

export default class rankPromp extends Phaser.Scene {
  constructor() {
    super("rankPrompt");
  }

  async create() {
    // Passo 1: Mostrar explicação
    await PopupUI.showInfo(this, "🏁 MODO SPEEDRUN", 
      "• Seu tempo será somado entre todas as fases.\n" +
      "• Apenas os melhores tempos serão salvos.\n" +
      "• Você jogará todas as fases em sequência."
    );

    // Passo 2: Pedir nome
    const playerName = await PopupUI.showTextInput(
      this, 
      "Identificação", 
      "Digite seu nome para o ranking:"
    );

    if (!playerName) {
      await PopupUI.showInfo(this, "Aviso", "É necessário inserir um nome para participar.");
      this.scene.stop();
      window.dispatchEvent(new CustomEvent('goToPage', { detail: 'principal' }));
      return;
    }

    RankRunState.enabled = true;
    RankRunState.name = playerName.trim();
    RankRunData.currentIndex = 1;
    RankRunData.totalTime = 0;
    RankRunData.mapTimes = {};

    console.log("🏁 Speedrun iniciado por", playerName);

    // Vai para o primeiro mapa
    this.scene.start("map1");
  }
}
