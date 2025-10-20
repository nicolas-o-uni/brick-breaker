import { Preferences } from '@capacitor/preferences';

export class GameProgressService {
  static phases = ['map1', 'map2', 'map3', 'map4', 'map5'];

  static async saveProgress(data: GameProgress) {
    await Preferences.set({
      key: 'game_progress',
      value: JSON.stringify(data)
    });
  }

  static async loadProgress(): Promise<GameProgress> {
    const { value } = await Preferences.get({ key: 'game_progress' });
    return value ? JSON.parse(value) : this.defaultProgress();
  }

  static defaultProgress(): GameProgress {
    // Inicializa bestTimes com todas as fases zeradas
    const bestTimes: Record<string, number> = {};
    this.phases.forEach(phase => {
      bestTimes[phase] = 0;
    });

    return {
      levelsCleared: [],
      powerUps: [],
      bestTimes
    };
  }
}

export interface GameProgress {
  levelsCleared: string[];
  powerUps: string[];
  bestTimes: Record<string, number>;
}