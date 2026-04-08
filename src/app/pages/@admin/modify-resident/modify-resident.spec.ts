import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyResident } from './modify-resident';

describe('ModifyResident', () => {
  let component: ModifyResident;
  let fixture: ComponentFixture<ModifyResident>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyResident]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyResident);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
