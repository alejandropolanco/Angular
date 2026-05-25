import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsStore } from './components-store';

describe('ComponentsStore', () => {
  let component: ComponentsStore;
  let fixture: ComponentFixture<ComponentsStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentsStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentsStore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
