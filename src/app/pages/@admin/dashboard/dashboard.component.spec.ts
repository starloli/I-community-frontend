import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { ApiService } from '../../../@service/api.service';
import { AnnouncementService } from '../../../@service/announcement.service';
import { PackageService } from '../../../@service/package.service';
import { RepairService } from '../../../@service/repair.service';
import { StatisticsService } from '../../../@service/statistics.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const announs$ = new BehaviorSubject<any[]>([]);
    const packages$ = new BehaviorSubject<any[]>([]);
    const repairs$ = new BehaviorSubject<any[]>([]);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getApi: () => of([])
          }
        },
        {
          provide: AnnouncementService,
          useValue: {
            announs$,
            getAll: () => of([])
          }
        },
        {
          provide: StatisticsService,
          useValue: {
            getUserNum: () => of(0)
          }
        },
        {
          provide: PackageService,
          useValue: {
            packages$,
            getAll: () => of([])
          }
        },
        {
          provide: RepairService,
          useValue: {
            repairs$,
            getAll: () => of([])
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
