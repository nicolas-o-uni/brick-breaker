import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';

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
export class AppComponent implements OnInit {

  constructor(private platform: Platform) {
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

  async ngOnInit() {
    await this.platform.ready();
    this.lockOrientation();
  }

  async lockOrientation() {
    try {
      // Tenta travar a tela em PORTRAIT (Vertical)
      await ScreenOrientation.lock({ orientation: 'portrait' });
    } catch (error) {
      // Ocorre erro se rodar no navegador desktop (não suporta lock), então ignoramos
      console.warn('Orientação de tela não suportada neste dispositivo/browser');
    }
  }
}