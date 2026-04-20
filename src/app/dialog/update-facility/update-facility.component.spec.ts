import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFacilityComponent } from './update-facility.component';

describe('UpdateFacility', () => {
  let component: UpdateFacilityComponent;
  let fixture: ComponentFixture<UpdateFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateFacilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
