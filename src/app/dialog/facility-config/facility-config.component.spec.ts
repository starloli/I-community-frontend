import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityConfigComponent } from './facility-config.component';

describe('FacilityConfigComponent', () => {
  let component: FacilityConfigComponent;
  let fixture: ComponentFixture<FacilityConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilityConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
