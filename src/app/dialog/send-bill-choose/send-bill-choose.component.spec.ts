import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendBillChooseComponent } from './send-bill-choose.component';

describe('SendBillChooseComponent', () => {
  let component: SendBillChooseComponent;
  let fixture: ComponentFixture<SendBillChooseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendBillChooseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendBillChooseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
