import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBillComponent } from './admin-bill.component';

describe('AdminBillComponent', () => {
  let component: AdminBillComponent;
  let fixture: ComponentFixture<AdminBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
