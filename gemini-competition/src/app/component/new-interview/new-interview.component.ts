import { Component } from '@angular/core';

@Component({
  selector: 'app-new-interview',
  templateUrl: './new-interview.component.html',
  styleUrls: ['./new-interview.component.css']
})
export class NewInterviewComponent {
  templates: string[] = ['Plantilla 1', 'Plantilla 2']; // Inicialmente dos plantillas con nombres

  addTemplate() {
    const newTemplateName = `Plantilla ${this.templates.length + 1}`;
    this.templates.push(newTemplateName);
  }

  generateLink(index: number) {
    console.log(`Generating link for ${this.templates[index]}`);
    // Lógica para generar el enlace aquí
  }
}
