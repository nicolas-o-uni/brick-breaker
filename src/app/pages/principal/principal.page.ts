import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton } from '@ionic/angular/standalone';

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
    this.router.navigate(['/maps']);
  }
}



