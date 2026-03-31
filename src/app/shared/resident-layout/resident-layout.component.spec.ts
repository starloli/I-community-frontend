import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentLayoutComponent } from './resident-layout.component';

describe('ResidentLayoutComponent', () => {
  let component: ResidentLayoutComponent;
  let fixture: ComponentFixture<ResidentLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidentLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
