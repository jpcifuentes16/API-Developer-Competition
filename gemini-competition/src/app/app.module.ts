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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    FormsModule
  ],  
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
