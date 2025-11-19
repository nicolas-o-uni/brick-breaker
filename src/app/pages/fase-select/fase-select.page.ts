import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fase-select',
  standalone: true,
  templateUrl: './fase-select.page.html',
  styleUrls: ['./fase-select.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class FaseSelectPage implements AfterViewInit {
  @ViewChild('slides', { static: true }) slides!: ElementRef<HTMLElement>;

  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;

  fases = [
    { img: 'assets/images/mapa-1.png' },
    { img: 'assets/images/mapa-2.png' },
    { img: 'assets/images/mapa-3.png'},
    { img: 'assets/images/mapa-4.png' },
    { img: 'assets/images/mapa-5.png' },
    { img: 'assets/images/mapa-6.png' }
  ];

  ngAfterViewInit() {
    const slider = this.slides.nativeElement;

    slider.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isDown = true;
      slider.setPointerCapture(e.pointerId);
      slider.classList.add('dragging');
      this.startX = e.clientX;
      this.scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDown) return;
      const walk = this.startX - e.clientX;
      slider.scrollLeft = this.scrollLeft + walk;
    });

    const stop = (e?: PointerEvent) => {
      this.isDown = false;
      try { slider.releasePointerCapture((e as any)?.pointerId); } catch {}
      slider.classList.remove('dragging');
    };

    slider.addEventListener('pointerup', stop);
    slider.addEventListener('pointercancel', stop);
    slider.addEventListener('pointerleave', stop);
  }

  openMap(img: string) {
    console.log('Mapa clicado:', img);
    

  }
  
}




