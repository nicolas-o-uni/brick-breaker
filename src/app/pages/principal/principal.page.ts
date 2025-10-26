import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { createGame, startRankRun, resetRankRun } from '../../game/phaser-game';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, CommonModule],
})
export class PrincipalPage implements OnInit, OnDestroy {
  private listener!: () => void;

  constructor(private router: Router) {}

  ngOnInit() {
    this.listener = () => {
      this.router.navigate(['/maps']); // abre página do jogo
      setTimeout(() => {
        const game = createGame();
        game.scene.start('rankPrompt');
      }, 100);
    };
    window.addEventListener('startRankPrompt', this.listener);
  }

  ngOnDestroy() {
    window.removeEventListener('startRankPrompt', this.listener);
  }

  goToMap1() {
    resetRankRun(); // garante estado limpo
    this.router.navigate(['/maps']);
  }

  goToSpeedrun() {
    startRankRun();
  }
}



