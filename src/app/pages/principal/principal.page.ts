import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { resetRankRun } from '../../game/phaser-game';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, CommonModule],
})
export class PrincipalPage implements OnInit, OnDestroy {
  constructor(private router: Router) {}

  ngOnInit() {}

  ngOnDestroy() {}

  goToMaps() {
    resetRankRun(); // garante estado limpo
    this.router.navigate(['/fase-select']);
  }
}
