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
    // Lógica para ingresar con el código de entrevista
    console.log('Ingresar con el código:', this.interviewCode);
  }

  nuevaEntrevista() {
    this.router.navigate(['/new-interview']);
  }

  verResultados() {
    // Lógica para ver resultados
    console.log('Ver resultados');
  }
}
