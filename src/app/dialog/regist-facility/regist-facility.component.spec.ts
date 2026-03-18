import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistFacilityComponent } from './regist-facility.component';

describe('RegistFacilityComponent', () => {
  let component: RegistFacilityComponent;
  let fixture: ComponentFixture<RegistFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistFacilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
