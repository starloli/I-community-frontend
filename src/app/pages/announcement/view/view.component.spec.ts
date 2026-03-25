import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:src/app/pages/resident/bill/bill.component.spec.ts
import { BillComponent } from './bill.component';

describe('BillComponent', () => {
  let component: BillComponent;
  let fixture: ComponentFixture<BillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillComponent);
========
import { ViewComponent } from './view.component';

describe('ViewComponent', () => {
  let component: ViewComponent;
  let fixture: ComponentFixture<ViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewComponent);
>>>>>>>> Vince:src/app/pages/announcement/view/view.component.spec.ts
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
