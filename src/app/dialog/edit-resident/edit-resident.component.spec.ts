import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResidentComponent } from './edit-resident.component';

describe('EditResident', () => {
  let component: EditResidentComponent;
  let fixture: ComponentFixture<EditResidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditResidentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditResidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
