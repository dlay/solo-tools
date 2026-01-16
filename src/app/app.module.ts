import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home.component';
import { MapComponent } from './components/map/map.component';
import { MapSidebarComponent } from './components/map/map-sidebar/map-sidebar.component';
import { TooltipWorldMapComponent } from './components/map/tooltip-world-map/tooltip-world-map.component';
import { AreaMapComponent } from './components/map/area-map/area-map.component';
import { AuthInterceptor } from './helpers/auth-interceptor';
import { AboutComponent } from './components/about/about.component';
import { PrivacyComponent } from './components/privacy/privacy.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MapComponent,
    MapSidebarComponent,
    TooltipWorldMapComponent,
    AreaMapComponent,
    AboutComponent,
    PrivacyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
