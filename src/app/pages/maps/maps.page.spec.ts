import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePage } from './maps.page';

describe('HomePage', () => {
  let component: GamePage;
  let fixture: ComponentFixture<GamePage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(GamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
