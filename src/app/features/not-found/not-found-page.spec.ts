import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  let component: NotFoundPage;
  let fixture: ComponentFixture<NotFoundPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => false },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the 404 code and a way back', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.not-found__code')?.textContent).toContain('404');
    expect(compiled.querySelector('.not-found__action')).toBeTruthy();
  });
});
