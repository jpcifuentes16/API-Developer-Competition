import { Component } from '@angular/core';
import { DataService } from 'src/app/shared/data.service';

@Component({
  selector: 'app-new-template',
  templateUrl: './new-template.component.html',
  styleUrls: ['./new-template.component.css']
})
export class NewTemplateComponent {
  templateName: string = '';
  configuration: string = '';

  constructor(private data: DataService) { }

  onSubmit() {
    if (this.templateName && this.configuration) {
      console.log('Nombre de la Plantilla:', this.templateName);
      console.log('Configuración:', this.configuration);
      // Lógica para guardar la plantilla

      this.data.createTemplate(this.templateName, this.configuration);
      
    }
  }
}
