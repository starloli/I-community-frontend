import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResident } from './edit-resident.component';

describe('EditResident', () => {
  let component: EditResident;
  let fixture: ComponentFixture<EditResident>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditResident]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditResident);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
