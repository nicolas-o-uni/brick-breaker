<<<<<<< HEAD
import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { createGame, destroyGame } from 'src/app/game/phaser-game';
=======
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { destroyGame } from 'src/app/game/phaser-game';
>>>>>>> afdec52901d884ce3d81b238a5d2813e1ad9b416
import Scene5 from 'src/app/game/scenes/scene5';

@Component({
  selector: 'app-game',
  templateUrl: './map5.page.html',
  imports: [IonicModule, CommonModule],
})
<<<<<<< HEAD
export class GamePage implements AfterViewInit, OnInit, OnDestroy {

  ngAfterViewInit() {
    destroyGame(); // garante que não há jogo ativo
=======
export class GamePage implements AfterViewInit {

  game!: Phaser.Game;

  ngAfterViewInit() {
>>>>>>> afdec52901d884ce3d81b238a5d2813e1ad9b416
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: 600,
      parent: 'game-container',
      physics: {
        default: 'arcade',
<<<<<<< HEAD
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      input: {
        keyboard: true
=======
        arcade: { gravity: { x: 0, y: 0 }, debug: true }
>>>>>>> afdec52901d884ce3d81b238a5d2813e1ad9b416
      },
      scene: [Scene5]
    };

<<<<<<< HEAD
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

=======
    this.game = new Phaser.Game(config);
  }

>>>>>>> afdec52901d884ce3d81b238a5d2813e1ad9b416
  // quando sair da página, destrói o game pra evitar instâncias duplicadas
  ionViewWillLeave() {
    destroyGame();
  }
<<<<<<< HEAD
=======

  ngOnDestroy() {
    destroyGame();
  }
>>>>>>> afdec52901d884ce3d81b238a5d2813e1ad9b416
}