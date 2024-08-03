import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  interviewCode: string = '';
  isButtonEnabled: boolean = false;

  constructor(private router : Router){}

  onInputChange() {
    this.isButtonEnabled = this.interviewCode.trim().length > 0;
  }

  ingresar() {
    this.router.navigate(['/interview', this.interviewCode]);
  }

  nuevaEntrevista() {
    this.router.navigate(['/new-interview']);
  }

  verResultados() {
    this.router.navigate(['/template-results']);
  }
}
