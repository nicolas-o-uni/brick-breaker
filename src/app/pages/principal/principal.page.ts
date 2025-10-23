import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { startRankRun, resetRankRun } from '../../game/phaser-game';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, CommonModule],
})
export class PrincipalPage {
  constructor(private router: Router) {}

  goToMap1() {
    resetRankRun(); // garante estado limpo
    this.router.navigate(['/maps']);
  }

  goToSpeedrun() {
    startRankRun();
    this.router.navigate(['/maps']); // irá iniciar no map1
  }
}



