import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RankService } from '../../game/services/onRank.service';
import { LocationService } from '../../game/services/location.service';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-all-rank',
  templateUrl: './all-rank.page.html',
  styleUrls: ['./all-rank.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class AllRankPage implements OnInit {
  rankType: 'world' | 'country' | 'state' = 'world';
  region: { country?: string; state?: string } | null = null;
  rankData: any[] = [];
  mapList = ['Tempo total', 'map1', 'map2', 'map3', 'map4', 'map5'];
  showLocationMessage = false;
  isLoading = false;

  constructor(private navCtrl: NavController, private alertCtrl: AlertController) {}

  async ngOnInit() {
    this.region = await LocationService.getRegion();
    await this.loadRankings();
  }

  async changeRankType(type: 'world' | 'country' | 'state') {
    this.rankType = type;
    await this.loadRankings();
  }

  async loadRankings() {
    this.rankData = [];
    this.showLocationMessage = false;

    let regionFilter: any = {};

    if (this.rankType === 'country') {
      if (!this.region?.country || this.region.country.trim() === '') {
        this.showLocationMessage = true;
        return;
      }
      regionFilter.country = this.region.country;
    } else if (this.rankType === 'state') {
      if (!this.region?.state || this.region.state.trim() === '') {
        this.showLocationMessage = true;
        return;
      }
      regionFilter.state = this.region.state;
    }

    console.log('📍Filtro aplicado:', regionFilter);
    console.log('📍Região detectada:', this.region);

    for (const mapId of this.mapList) {
      const scores = await RankService.getTopScores(mapId, regionFilter);
      const best = scores.length ? scores[0] : null;
      this.rankData.push({ mapName: mapId, best, scores });
    }
  }

  async retryLocation() {
    this.isLoading = true;
    this.showLocationMessage = false;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      this.region = await LocationService.getRegion();
      console.log('📍Nova permissão concedida, região:', this.region);
      await this.loadRankings();

    } catch (err: any) {
      console.warn('⚠️ Permissão de localização negada ou erro:', err);

      if (err.code === 1) {
        const alert = await this.alertCtrl.create({
          header: '⚠️ Permissão negada',
          message:
            'Acesso à localização foi bloqueado. Ative a permissão nas configurações do dispositivo para visualizar rankings regionais.',
          buttons: [
            {
              text: 'OK',
              role: 'cancel',
              cssClass: 'custom-alert-button',
            },
          ],
          cssClass: 'custom-alert',
        });
        await alert.present();
      }

      this.showLocationMessage = true;
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.navCtrl.navigateBack('/principal');
  }
}
