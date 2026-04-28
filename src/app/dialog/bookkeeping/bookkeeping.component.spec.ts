import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookkeepingComponent } from './bookkeeping.component';

describe('BookkeepingComponent', () => {
  let component: BookkeepingComponent;
  let fixture: ComponentFixture<BookkeepingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookkeepingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookkeepingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
