import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-temp-ui',
  templateUrl: './temp-ui.component.html',
  styleUrls: ['./temp-ui.component.css']
})
export class TempUIComponent implements OnInit {

  nameCandidate: string = "José Cifuentes";
  timer: number = 0;
  interval: any;
  id: string = "E0wSe7uENdvzX9P5uHrr";
  formattedId: string = "";
  isUserTurn = false;

  constructor() {
    this.formattedId = this.formatId(this.id);
  }

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  formatId(id: string): string {
    if (id.length >= 13) {
      return `${id.substring(0, 3)}-${id.substring(3, 7)}-${id.substring(7, 10)}`;
    }
    return id;
  }

  startTimer(): void {
    this.interval = setInterval(() => {
      this.timer++;
    }, 1000); // Incrementa el cronómetro cada segundo
  }

  clearTimer(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  getFirstLetterUpperCase(): string {
    if (this.nameCandidate && this.nameCandidate.length > 0) {
      return this.nameCandidate.charAt(0).toUpperCase();
    }
    return '';
  }


  formatTimer(): string {
    const hours = Math.floor(this.timer / 3600);
    const minutes = Math.floor((this.timer % 3600) / 60);
    const seconds = this.timer % 60;

    if (hours > 0) {
      return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    } else {
      return `${this.pad(minutes)}:${this.pad(seconds)}`;
    }
  }

  pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

}
