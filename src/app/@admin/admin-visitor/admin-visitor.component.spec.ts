import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApiService } from '../../@service/api.service';
import { AdminVisitorComponent } from './admin-visitor.component';

describe('AdminVisitorComponent', () => {
  let component: AdminVisitorComponent;
  let fixture: ComponentFixture<AdminVisitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminVisitorComponent],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getApi: () => of([]),
            postApi: () => of({}),
            putApi: () => of({})
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
