import Phaser from 'phaser';
import { GameProgressService, GameProgress } from './services/game-progress.service';

export abstract class BaseFase extends Phaser.Scene {
  protected progress!: GameProgress;
  startTime!: number;
  protected faseName!: string;

  async createBase(faseName: string) {
    this.faseName = faseName;
    this.progress = await GameProgressService.loadProgress();
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