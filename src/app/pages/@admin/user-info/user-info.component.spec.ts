import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:src/app/pages/@admin/modify-resident/modify-resident.spec.component.ts
import { ModifyResident } from './modify-resident.component';
========
import { UserInfoComponent } from './user-info.component';
>>>>>>>> starlo:src/app/pages/@admin/user-info/user-info.component.spec.ts

describe('UserInfo', () => {
  let component: UserInfoComponent;
  let fixture: ComponentFixture<UserInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
