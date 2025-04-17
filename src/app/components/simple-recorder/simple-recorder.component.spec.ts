import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleRecorderComponent } from './simple-recorder.component';

describe('SimpleRecorderComponent', () => {
  let component: SimpleRecorderComponent;
  let fixture: ComponentFixture<SimpleRecorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleRecorderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
