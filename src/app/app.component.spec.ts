import { async, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AttributesComponent } from './attributes/attributes.component';
import { MapComponent } from './map/map.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        AttributesComponent,
        MapComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
