import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllRankPage } from './all-rank.page';

describe('AllRankPage', () => {
  let component: AllRankPage;
  let fixture: ComponentFixture<AllRankPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AllRankPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
