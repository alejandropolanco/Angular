import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesStore } from './pages-store';

describe('PagesStore', () => {
  let component: PagesStore;
  let fixture: ComponentFixture<PagesStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesStore],
    }).compileComponents();

    fixture = TestBed.createComponent(PagesStore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
