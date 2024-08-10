import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/shared/data.service';

interface Question {
  evaluation: string;
  question: string;
  answer: string;
  section: number;
  points: string;
}

interface InterviewData {
  author: string;
  name: string;
  questions: {
    questions: Question[];
  };
  id: string;
  templateId: string;
}

@Component({
  selector: 'app-interview-details',
  templateUrl: './interview-details.component.html',
  styleUrls: ['./interview-details.component.css']
})
export class InterviewDetailsComponent implements OnInit {
  @Input() interviewId: string = "";
  interviewData: InterviewData | undefined;
  groupedQuestions: { [key: number]: Question[] } = {};  // <- Asegúrate de que esté correctamente tipado
  openSections: { [key: number]: boolean } = {};

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    if (!this.interviewId) {
      this.route.params.subscribe(params => {
        this.interviewId = params['id'];
        this.loadInterviewData();
      });
    } else {
      this.loadInterviewData();
    }
  }

  loadInterviewData(): void {
    this.dataService.getInterviewData(this.interviewId).subscribe((data: InterviewData) => {
      this.interviewData = data;
      this.groupQuestionsBySection();
    });
  }

  groupQuestionsBySection(): void {
    if (this.interviewData) {
      this.interviewData.questions.questions.forEach((question: Question) => {
        if (!this.groupedQuestions[question.section]) {
          this.groupedQuestions[question.section] = [];
        }
        this.groupedQuestions[question.section].push(question);
      });
    }
  }

  toggleSection(index: number): void {
    this.openSections[index] = !this.openSections[index];
  }

  isSectionOpen(index: number): boolean {
    return this.openSections[index];
  }
}
