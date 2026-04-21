import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendBillComponent } from './send-bill.component';

describe('SendBillComponent', () => {
  let component: SendBillComponent;
  let fixture: ComponentFixture<SendBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
