import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyResidentComponent } from './modify-resident.component';

describe('ModifyResidentComponent', () => {
  let component: ModifyResidentComponent;
  let fixture: ComponentFixture<ModifyResidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyResidentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyResidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
