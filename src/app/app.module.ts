import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavComponent } from './components/nav/nav.component';
import { HeaderComponent } from './components/header/header.component';
import { AboutComponent } from './components/about/about.component';
import { ReservationComponent } from './components/reservation/reservation.component';
import { ContactComponent } from './components/contact/contact.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { LogoRenderComponent } from './components/logo-render/logo-render.component';
import { NavItemComponent } from './components/nav-item/nav-item.component';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { StoreModule } from '@ngrx/store';
import { loadingReducer } from './store/reducers/loading.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    NavComponent,
    HeaderComponent,
    AboutComponent,
    ReservationComponent,
    ContactComponent,
    PageNotFoundComponent,
    LogoRenderComponent,
    NavItemComponent,
    LoadingScreenComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({
      loading: loadingReducer
    }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
