import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { destroyGame } from 'src/app/game/phaser-game';
import MainScene from 'src/app/game/scenes/main-scene';

@Component({
  selector: 'app-game',
  templateUrl: './map1.page.html',
  imports: [IonicModule, CommonModule],
})
export class GamePage implements AfterViewInit {

  game!: Phaser.Game;

  ngAfterViewInit() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: true }
      },
      scene: [MainScene]
    };

    this.game = new Phaser.Game(config);
  }

  // quando sair da página, destrói o game pra evitar instâncias duplicadas
  ionViewWillLeave() {
    destroyGame();
  }

  ngOnDestroy() {
    destroyGame();
  }
}