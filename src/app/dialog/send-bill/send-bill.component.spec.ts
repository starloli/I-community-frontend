import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendBill } from './send-bill.component';

describe('SendBill', () => {
  let component: SendBill;
  let fixture: ComponentFixture<SendBill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendBill]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendBill);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
