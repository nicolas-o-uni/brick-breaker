import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamePage  } from './map3.page';

describe('Map3Page', () => {
  let component: GamePage;
  let fixture: ComponentFixture<GamePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
