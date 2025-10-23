// rankedSummary.ts
import Phaser from 'phaser';
import { RankRunData, resetRankRun } from '../phaser-game';
import { RankService } from "../services/onRank.service";

export default class RankedSummary extends Phaser.Scene {
  constructor() {
    super({ key: 'rank' });
  }

  async create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setOrigin(0);

    this.add.text(W/2, 40, 'SPEEDRUN CONCLUÍDA', { fontSize: '28px', color: '#fff' }).setOrigin(0.5);

    let y = 100;
    // exibe cada mapa e tempo
    Object.entries(RankRunData.mapTimes).forEach(([map, time]) => {
      this.add.text(W/2, y, `${map}: ${time.toFixed(2)}s`, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
      y += 36;
    });

    this.add.text(W/2, y + 10, `Tempo total: ${RankRunData.totalTime.toFixed(2)}s`, { fontSize: '22px', color: '#0f0' }).setOrigin(0.5);

    // Pergunta opcional para salvar no Firebase (só se o jogador quiser)
    const save = confirm("Deseja salvar seus tempos no ranking online?");
    if (save) {
      const playerName = prompt("Digite seu nome para o ranking:") || "Jogador";

      // Salva tempo total como um registro específico (ex: 'speedrun_total')
      try {
        await RankService.saveScore('speedrun_total', playerName, RankRunData.totalTime);

        // além disso, salve cada mapa separadamente como no saveScore normal
        for (const [map, time] of Object.entries(RankRunData.mapTimes)) {
          await RankService.saveScore(map, playerName, time);
        }

        console.log('✅ Speedrun salva com sucesso!');
      } catch (err) {
        console.error('Erro ao salvar speedrun:', err);
      }
    }

    // botão de voltar ao menu
    const btnText = this.add.text(W/2, y + 100, 'Voltar ao Menu', { fontSize:'20px', color:'#00BFFF' }).setOrigin(0.5).setInteractive();
    btnText.on('pointerdown', () => {
      resetRankRun();
      window.dispatchEvent(new CustomEvent('goToPage', { detail: 'principal' }));
    });
  }
}
