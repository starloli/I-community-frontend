import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:src/app/pages/@admin/user-info/user-info.spec.component.ts
import { UserInfo } from './user-info.component';
========
<<<<<<<< HEAD:src/app/pages/@resident/user-info/user-info.component.spec.ts
import { UserInfoComponent } from './user-info.component';
========
import { DeleteFacility } from './delete-facility.component';
>>>>>>>> main:src/app/pages/@resident/user-info/delete-facility.spec.component.ts
>>>>>>>> starlo:src/app/pages/@resident/user-info/user-info.component.spec.ts

describe('UserInfo', () => {
  let component: UserInfo;
  let fixture: ComponentFixture<UserInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInfo]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
