import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialDashboardResidentComponent } from './financial-dashboard-resident.component';

describe('FinancialDashboardResidentComponent', () => {
  let component: FinancialDashboardResidentComponent;
  let fixture: ComponentFixture<FinancialDashboardResidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialDashboardResidentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialDashboardResidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
