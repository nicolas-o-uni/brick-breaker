import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { destroyGame } from 'src/app/game/phaser-game';

@Component({
  selector: 'app-game',
  templateUrl: './maps.page.html',
  imports: [IonicModule, CommonModule],
})
export class GamePage implements OnInit, OnDestroy {

  constructor(private router: Router) {}

  ngOnInit() {
    window.addEventListener('goToPage', this.handlePageNavigation);
  }

  ngOnDestroy() {
    // não destrói o game ao sair, apenas pausa
  }

  handlePageNavigation = (event: any) => {
    const targetPage = event.detail;
    this.router.navigateByUrl(`/${targetPage}`, { replaceUrl: true, skipLocationChange: false })
      .then(() => {
        destroyGame();
      });
  };

  // quando sair da página, destrói o game pra evitar instâncias duplicadas
  ionViewWillLeave() {
    destroyGame();
  }
}