import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempUIComponent } from './temp-ui.component';

describe('TempUIComponent', () => {
  let component: TempUIComponent;
  let fixture: ComponentFixture<TempUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TempUIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TempUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
