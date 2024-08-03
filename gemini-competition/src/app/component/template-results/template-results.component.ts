import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/shared/data.service';

interface IInterviewTemplate {
  configuration: string;
  id: string;
  name: string;
}

interface ICandidateResult {
  candidateName: string;
  score: number;
  interviewDate: Date;
}

@Component({
  selector: 'app-template-results',
  templateUrl: './template-results.component.html',
  styleUrls: ['./template-results.component.css']
})
export class TemplateResultsComponent implements OnInit {
  templates: IInterviewTemplate[] = [];
  results: { [key: string]: ICandidateResult[] } = {};
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


  goToInterviewResults(templateId: string, templateName: string) {
    this.router.navigate(['/interview-results'], { queryParams: { templateId: templateId, name: templateName } });

  }
}
