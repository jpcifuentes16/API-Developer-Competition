import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  interviewCode: string = '';
  isButtonEnabled: boolean = false;

  onInputChange() {
    this.isButtonEnabled = this.interviewCode.trim().length > 0;
  }

  ingresar() {
    // Lógica para ingresar con el código de entrevista
    console.log('Ingresar con el código:', this.interviewCode);
  }

  nuevaEntrevista() {
    // Lógica para nueva entrevista
    console.log('Nueva entrevista');
  }

  verResultados() {
    // Lógica para ver resultados
    console.log('Ver resultados');
  }
}
