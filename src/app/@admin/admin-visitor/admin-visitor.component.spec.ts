import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVisitorComponent } from './admin-visitor.component';

describe('AdminVisitorComponent', () => {
  let component: AdminVisitorComponent;
  let fixture: ComponentFixture<AdminVisitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminVisitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
