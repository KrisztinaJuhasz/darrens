import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoRenderComponent } from './logo-render.component';

describe('LogoRenderComponent', () => {
  let component: LogoRenderComponent;
  let fixture: ComponentFixture<LogoRenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogoRenderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
