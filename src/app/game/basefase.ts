import Phaser from 'phaser';
import { GameProgressService, GameProgress } from './services/game-progress.service';

export abstract class BaseFase extends Phaser.Scene {
  protected progress!: GameProgress;
  protected faseName!: string;
  onProgressLoaded?: () => void;
  startTime!: number;
  timerText!: Phaser.GameObjects.Text;
  gameTime: number = 0; // Tempo acumulado em ms
  pauseMenuContainer!: Phaser.GameObjects.Container;
  ball!: Phaser.Physics.Arcade.Image;
  balls!: Phaser.Physics.Arcade.Group;
  paddle!: Phaser.Physics.Arcade.Image;
  bricks!: Phaser.Physics.Arcade.StaticGroup;
  specialBlocks!: Phaser.Physics.Arcade.Image[]; // Agora é uma lista
  multiplyBallBlocks!: Phaser.Physics.Arcade.Image[];
  invertScreenBlocks!: Phaser.Physics.Arcade.Image[];
  speedBoostBlocks!: Phaser.Physics.Arcade.Image[];
  isScreenInverted: boolean = false;
  paddleSound!: Phaser.Sound.BaseSound;
  brickSound!: Phaser.Sound.BaseSound;

  async createBase(faseName: string) {
    this.faseName = faseName;
    this.progress = await GameProgressService.loadProgress();
    console.log('✅ Base criada para', faseName);
    console.log('Progresso carregado:', this.progress);

    // Novo: callback opcional
    if (this.onProgressLoaded) {
      this.onProgressLoaded();
    }
  }

  async winLevel() {
    const timeInSeconds = (Date.now() - this.startTime) / 1000;
    console.log(timeInSeconds);

    // Atualiza levelsCleared
    if (!this.progress.levelsCleared.includes(this.faseName)) {
      this.progress.levelsCleared.push(this.faseName);
    }

    // Atualiza bestTimes
    if (!this.progress.bestTimes[this.faseName] || timeInSeconds < this.progress.bestTimes[this.faseName]) {
      this.progress.bestTimes[this.faseName] = timeInSeconds;
    }

    await GameProgressService.saveProgress(this.progress);
  }
}