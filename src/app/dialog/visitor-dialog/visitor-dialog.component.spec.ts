import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { VisitorServiceService } from '../../@service/visitor-service.service';
import { VisitorDialogComponent } from './visitor-dialog.component';

describe('VisitorDialogComponent', () => {
  let component: VisitorDialogComponent;
  let fixture: ComponentFixture<VisitorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            visitor: {
              visitorName: 'Test Visitor',
              residentialAddress: 'A-101'
            },
            permissions: 'admin'
          }
        },
        {
          provide: VisitorServiceService,
          useValue: {
            visitorId: null,
            permissions: 'admin'
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
