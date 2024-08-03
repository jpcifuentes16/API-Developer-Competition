import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateResultsComponent } from './template-results.component';

describe('TemplateResultsComponent', () => {
  let component: TemplateResultsComponent;
  let fixture: ComponentFixture<TemplateResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
