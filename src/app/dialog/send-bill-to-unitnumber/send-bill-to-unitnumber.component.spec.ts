import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendBillToUnitnumberComponent } from './send-bill-to-unitnumber.component';

describe('SendBillToUnitnumberComponent', () => {
  let component: SendBillToUnitnumberComponent;
  let fixture: ComponentFixture<SendBillToUnitnumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendBillToUnitnumberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendBillToUnitnumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
