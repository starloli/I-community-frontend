import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { ApiService } from '../../../@service/api.service';
import { VisitorServiceService } from '../../../@service/visitor-service.service';
import { VisitorComponent } from './admin-visitor.component';

describe('VisitorComponent', () => {
  let component: VisitorComponent;
  let fixture: ComponentFixture<VisitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorComponent],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getApi: () => of([]),
            postApi: () => of({}),
            putApi: () => of({})
          }
        },
        {
          provide: VisitorServiceService,
          useValue: {}
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

    fixture = TestBed.createComponent(VisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
