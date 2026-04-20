import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { AnnouncementService } from '../../../@service/announcement.service';
import { ResidentAnnouncementComponent } from './announcement.component';

describe('ResidentAnnouncementComponent', () => {
  let component: ResidentAnnouncementComponent;
  let fixture: ComponentFixture<ResidentAnnouncementComponent>;

  beforeEach(async () => {
    const announs$ = new BehaviorSubject<any[]>([]);

    await TestBed.configureTestingModule({
      imports: [ResidentAnnouncementComponent],
      providers: [
        {
          provide: AnnouncementService,
          useValue: {
            announs$,
            getAll: () => of([])
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidentAnnouncementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
