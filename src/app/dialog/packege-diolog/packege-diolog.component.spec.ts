import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackegeDiologComponent } from './packege-diolog.component';

describe('PackegeDiologComponent', () => {
  let component: PackegeDiologComponent;
  let fixture: ComponentFixture<PackegeDiologComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackegeDiologComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackegeDiologComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
