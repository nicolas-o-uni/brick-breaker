import { Component } from '@angular/core';

@Component({
  selector: 'app-fase-select',
  templateUrl: './fase-select.page.html',
  styleUrls: ['./fase-select.page.scss']
})
export class FaseSelectPage {

  fases = [
    { id: 1, name: 'Fase 1' },
    { id: 2, name: 'Fase 2' },
    { id: 3, name: 'Fase 3' },
    { id: 4, name: 'Fase 4' },
    { id: 5, name: 'Fase 5' },
    { id: 6, name: 'Fase 6' }
  ];

  draggingItem: any = null;

  startDrag(item: any) {
    this.draggingItem = item;
  }

  endDrag() {
    this.draggingItem = null;
  }

  drop(event: any) {
    const movedItem = this.draggingItem;
    const index = this.fases.indexOf(movedItem);
    this.fases.splice(index, 1);
    this.fases.splice(event.detail.to, 0, movedItem);
    event.detail.complete();
  }
}

