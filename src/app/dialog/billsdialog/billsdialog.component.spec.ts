import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsdialogComponent } from './billsdialog.component';

describe('BillsdialogComponent', () => {
  let component: BillsdialogComponent;
  let fixture: ComponentFixture<BillsdialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillsdialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillsdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
