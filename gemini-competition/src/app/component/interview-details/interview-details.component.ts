import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/shared/data.service';

@Component({
  selector: 'app-interview-details',
  templateUrl: './interview-details.component.html',
  styleUrls: ['./interview-details.component.css']
})
export class InterviewDetailsComponent implements OnInit {
  @Input() interviewId: string = "";
  interviewData: any;
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
    this.dataService.getInterviewData(this.interviewId).subscribe(data => {
      this.interviewData = data;
    });
  }

  toggleSection(index: number): void {
    this.openSections[index] = !this.openSections[index];
  }

  isSectionOpen(index: number): boolean {
    return this.openSections[index];
  }
}
