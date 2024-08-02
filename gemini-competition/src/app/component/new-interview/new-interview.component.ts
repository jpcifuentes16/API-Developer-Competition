import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/shared/data.service';

interface IInterviewTemplate {
  configuration: string;
  id: string;
  name: string;
}

@Component({
  selector: 'app-new-interview',
  templateUrl: './new-interview.component.html',
  styleUrls: ['./new-interview.component.css']
})
export class NewInterviewComponent {
  templates: IInterviewTemplate[] = [];
  isModalOpen = false;
  inputName = '';
  currentTemplateIndex: number = 0;

  constructor(private data: DataService, private router: Router) {}

  ngOnInit(): void {
    this.getAllTemplates();
  }

  getAllTemplates() {
    this.data.getTemplates().subscribe(res => {
      this.templates = res;
    }, err => {
      alert('Error al obtener los datos de las plantillas');
    });
  }

  addTemplate() {
    this.router.navigate(['/new-template']);
  }

  openModal(index: number) {
    this.currentTemplateIndex = index;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.inputName = '';
    this.currentTemplateIndex = 0;
  }

  submitName() {
    if (this.inputName.trim()) {
      this.data.createInterview(this.templates[this.currentTemplateIndex].id, this.inputName).subscribe(() => {
        this.closeModal();
      }, err => {
        alert(`Error al generar el enlace: ${err}`);
      });
    } else {
      alert('Por favor, ingrese un nombre válido.');
    }
  }
}
