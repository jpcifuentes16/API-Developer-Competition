import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { HomeComponent } from './component/home/home.component';
import { NewInterviewComponent } from './component/new-interview/new-interview.component';
import { NewTemplateComponent } from './component/new-template/new-template.component';
import { InterviewComponent } from './component/interview/interview.component';
import { TemplateResultsComponent } from './component/template-results/template-results.component';
import { InterviewResultsComponent } from './component/interview-results/interview-results.component';
import { InterviewDetailsComponent } from './component/interview-details/interview-details.component';
import { TempUIComponent } from './component/temp-ui/temp-ui.component';

const routes: Routes = [
  {path: '', redirectTo:'login', pathMatch:'full'},
  {path: 'login', component : LoginComponent},
  {path: 'register', component : RegisterComponent},
  {path: 'home', component : HomeComponent},
  {path: 'new-interview', component : NewInterviewComponent},
  {path: 'new-template', component : NewTemplateComponent},
  {path: 'template-results', component : TemplateResultsComponent},
  {path: 'interview-results', component : InterviewResultsComponent},
  {path: 'interview/:id', component : InterviewComponent},
  {path: 'interview-details/:id', component : InterviewDetailsComponent},
  {path: 'tempui', component : TempUIComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
