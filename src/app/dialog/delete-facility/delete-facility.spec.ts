import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteFacility } from './delete-facility';

describe('DeleteFacility', () => {
  let component: DeleteFacility;
  let fixture: ComponentFixture<DeleteFacility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteFacility]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteFacility);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
