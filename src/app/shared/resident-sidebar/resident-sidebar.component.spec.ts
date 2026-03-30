import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentSidebarComponent } from './resident-sidebar.component';

describe('ResidentSidebarComponent', () => {
  let component: ResidentSidebarComponent;
  let fixture: ComponentFixture<ResidentSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidentSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
