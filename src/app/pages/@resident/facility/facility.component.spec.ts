import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { HttpService } from '../../../@service/http.service';
import { ResidentFacilityComponent } from './facility.component';

describe('ResidentFacilityComponent', () => {
  let component: ResidentFacilityComponent;
  let fixture: ComponentFixture<ResidentFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentFacilityComponent],
      providers: [
        {
          provide: HttpService,
          useValue: {
            getApi: () => of([]),
            putApi: () => of(true)
          }
        },
        {
          provide: MatSnackBar,
          useValue: {
            open: () => {}
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => ({
              afterClosed: () => of(null)
            })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidentFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
