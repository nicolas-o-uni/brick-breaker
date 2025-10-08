import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { createGame, destroyGame } from 'src/app/game/phaser-game';
import Scene1 from 'src/app/game/scenes/scene1';

@Component({
  selector: 'app-game',
  templateUrl: './map1.page.html',
  imports: [IonicModule, CommonModule],
})
export class GamePage implements AfterViewInit, OnInit, OnDestroy {

  ngAfterViewInit() {
    destroyGame(); // garante que não há jogo ativo
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: 600,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      input: {
        keyboard: true
      },
      scene: [Scene1]
    };

    createGame(config);
  }

  constructor(private router: Router) {}

  ngOnInit() {
    // Escuta o evento disparado pelo Phaser
    window.addEventListener('goToPage', this.handlePageNavigation);
  }

  ngOnDestroy() {
    window.removeEventListener('goToPage', this.handlePageNavigation);
  }

  handlePageNavigation = (event: any) => {
    const targetPage = event.detail;
    this.router.navigateByUrl(`/${targetPage}`, { replaceUrl: true, skipLocationChange: false })
    .then(() => {
      window.location.reload(); // força recarregar o componente inteiro
    });
  };

  // quando sair da página, destrói o game pra evitar instâncias duplicadas
  ionViewWillLeave() {
    destroyGame();
  }
}