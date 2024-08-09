import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarewellComponent } from './farewell.component';

describe('FarewellComponent', () => {
  let component: FarewellComponent;
  let fixture: ComponentFixture<FarewellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FarewellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarewellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
