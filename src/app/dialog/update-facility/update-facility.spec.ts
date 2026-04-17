import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFacility } from './update-facility.component';

describe('UpdateFacility', () => {
  let component: UpdateFacility;
  let fixture: ComponentFixture<UpdateFacility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateFacility]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateFacility);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
