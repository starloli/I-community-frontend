import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:src/app/pages/reset-password/reset-password.spec.component.ts
import { ResetPassword } from './reset-password.component';
========
import { ResetPasswordComponent } from './reset-password.component';
>>>>>>>> starlo:src/app/pages/reset-password/reset-password.component.spec.ts

describe('ResetPassword', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
