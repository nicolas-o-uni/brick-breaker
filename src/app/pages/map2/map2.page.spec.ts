import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Map2Page } from './map2.page';

describe('Map2Page', () => {
  let component: Map2Page;
  let fixture: ComponentFixture<Map2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Map2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
