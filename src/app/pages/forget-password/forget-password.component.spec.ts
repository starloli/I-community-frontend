import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:src/app/pages/forget-password/forget-password.spec.component.ts
import { ForgetPassword } from './forget-password.component';
========
import { ForgetPasswordComponent } from './forget-password.component';
>>>>>>>> starlo:src/app/pages/forget-password/forget-password.component.spec.ts

describe('ForgetPassword', () => {
  let component: ForgetPasswordComponent;
  let fixture: ComponentFixture<ForgetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
