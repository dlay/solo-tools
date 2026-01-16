import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipWorldMapComponent } from './tooltip-world-map.component';

describe('TooltipWorldMapComponent', () => {
  let component: TooltipWorldMapComponent;
  let fixture: ComponentFixture<TooltipWorldMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TooltipWorldMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipWorldMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
