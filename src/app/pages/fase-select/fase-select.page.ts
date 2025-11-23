import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { createGame, resetRankRun, startRankRun } from '../../game/phaser-game';
import { GameProgressService, GameProgress } from '../../game/services/game-progress.service';
import { addIcons } from 'ionicons';
import { arrowBack, trophyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-fase-select',
  standalone: true,
  templateUrl: './fase-select.page.html',
  styleUrls: ['./fase-select.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class FaseSelectPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('slides', { static: true }) slides!: ElementRef<HTMLElement>;

  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private isDragging = false;
  private startRankListener!: () => void;

  // Controle do Pop-up
  showLockedPopup = false;
  lockedPhaseNumber = 0;

  fases = [
    { img: 'assets/images/mapa-1.png' },
    { img: 'assets/images/mapa-2.png' },
    { img: 'assets/images/mapa-3.png' },
    { img: 'assets/images/mapa-4.png' },
    { img: 'assets/images/mapa-5.png' },
  ];

  // unlocked flags (true = clicável)
  unlocked: boolean[] = [];

  progress: GameProgress | null = null;

  constructor(private router: Router) {
    addIcons({ arrowBack, trophyOutline });

    // inicializa unlocked todos false até carregar progresso
    this.unlocked = this.fases.map(() => false);
  }

  async ngOnInit() {
    await this.loadProgressAndComputeUnlocks();

    this.startRankListener = () => {
      this.router.navigate(['/maps']);
      setTimeout(() => {
        // Passamos 'rankPrompt' para o BootScene saber o que abrir
        createGame('rankPrompt'); 
      }, 100);
    };

    window.addEventListener('startRankPrompt', this.startRankListener);
  }

  ngAfterViewInit() {
    const slider = this.slides.nativeElement;

    slider.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isDown = true;
      this.isDragging = false; // Reseta estado
      this.startX = e.pageX - slider.offsetLeft;
      this.scrollLeft = slider.scrollLeft;
      
      // REMOVA OU COMENTE ESTA LINHA ABAIXO PARA O CLICK FUNCIONAR MELHOR:
      // slider.setPointerCapture(e.pointerId); 
    });

    slider.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDown) return;
      
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - this.startX); // Velocidade do scroll
      
      // Se moveu mais de 5 pixels, consideramos que é um ARRASTO, não um clique
      if (Math.abs(walk) > 5) {
         this.isDragging = true; 
      }

      slider.scrollLeft = this.scrollLeft - walk;
    });

    const stop = () => {
      this.isDown = false;
      // slider.releasePointerCapture... (pode remover se removeu o setPointerCapture)
    };

    slider.addEventListener('pointerup', stop);
    slider.addEventListener('pointerleave', stop);
  }

  ngOnDestroy() {
    try {
      window.removeEventListener('startRankPrompt', this.startRankListener);
    } catch {}
  }

  goBack() {
    this.router.navigate(['/principal']); 
  }

  goToRank() {
    this.router.navigate(['/all-rank']);
  }

  closePopup() {
    this.showLockedPopup = false;
  }

  async refreshProgress() {
    await this.loadProgressAndComputeUnlocks();
  }

  private async loadProgressAndComputeUnlocks() {
    this.progress = await GameProgressService.loadProgress();

    // regra: fase1 sempre desbloqueada
    this.unlocked = this.fases.map((_, idx) => {
      if (idx === 0) return true;
      const prevKey = `map${idx}`; // idx=1 -> prevKey=map1
      return this.progress?.levelsCleared.includes(prevKey) ?? false;
    });
  }

  // abrir mapa pelo index (0-based). Garante desbloqueio antes de abrir
  async openMap(index: number) {
    if (this.isDragging) {
        this.isDragging = false; // reseta e sai
        return;
    }

    console.log('Agora sim fui clicado! Index:', index);
    
    // limite de mapas: map1..map5 (o seu phaser-game só tem map1..map5)
    const mapNumber = Math.min(index + 1, 5);
    const mapKey = `map${mapNumber}`;

    if (!this.unlocked[index]) {
      this.lockedPhaseNumber = mapNumber;
      this.showLockedPopup = true;
      return;
    }

    // abrir a página do jogo, criar e iniciar cena específica
    resetRankRun();
    this.router.navigate(['/maps']);
    setTimeout(() => {
      createGame(mapKey);
    }, 100);
  }

  // Inicia o fluxo de Speedrun (disparará o evento startRankPrompt que o listener acima captura)
  startSpeedrun() {
    // inicia o processo de RankRun (mostra o prompt). O listener de startRankPrompt fará a navegação e abrirá rankPrompt
    startRankRun();
  }
}