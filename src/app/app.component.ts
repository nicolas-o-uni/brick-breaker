import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  constructor() {
    this.initializeApp();
  }

  async initializeApp() {
    try {
      await StatusBar.hide(); // remove status bar
      await StatusBar.setOverlaysWebView({ overlay: true }); // faz o app ocupar a tela inteira
    } catch(e) {
      console.log('StatusBar error:', e);
    }
  }
}