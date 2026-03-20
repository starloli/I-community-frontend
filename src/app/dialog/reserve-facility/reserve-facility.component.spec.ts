import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserveFacilityComponent } from './reserve-facility.component';

describe('ReserveFacilityComponent', () => {
  let component: ReserveFacilityComponent;
  let fixture: ComponentFixture<ReserveFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReserveFacilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReserveFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
