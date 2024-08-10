import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat'
import { environment } from 'src/environments/environment';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { FormsModule } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HomeComponent } from './component/home/home.component';
import { NewInterviewComponent } from './component/new-interview/new-interview.component';
import { NewTemplateComponent } from './component/new-template/new-template.component';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { InterviewComponent } from './component/interview/interview.component'; // Importa HttpClientModule
import { LoaderInterceptor } from './loader.interceptor';
import { LoaderComponent } from './loader/loader.component';
import { TemplateResultsComponent } from './component/template-results/template-results.component';
import { InterviewResultsComponent } from './component/interview-results/interview-results.component';
import { InterviewDetailsComponent } from './component/interview-details/interview-details.component';
import { TempUIComponent } from './component/temp-ui/temp-ui.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FarewellComponent } from './component/farewell/farewell.component';



import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    NewInterviewComponent,
    NewTemplateComponent,
    InterviewComponent,
    LoaderComponent,
    TemplateResultsComponent,
    InterviewResultsComponent,
    InterviewDetailsComponent,
    TempUIComponent,
    FarewellComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatListModule,
  ],  
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
