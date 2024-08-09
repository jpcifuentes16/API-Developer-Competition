import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/shared/data.service';
import { ChangeDetectorRef } from '@angular/core'; // Importar ChangeDetectorRef

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.css']
})
export class InterviewComponent implements OnInit {
  interviewId: string = "";
  interviewData: any;
  currentQuestionIndex: number = 0;
  mediaRecorder: any;
  audioChunks: any[] = [];
  isUserTurn: boolean = false;

  nameCandidate: string = "";
  timer: number = 0;
  interval: any;
  formattedId: string = "";

  constructor(
    private route: ActivatedRoute, 
    private data: DataService, 
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.interviewId = params.get('id')!;
      this.formattedId = this.formatId(this.interviewId);
      this.loadInterviewData();
      this.startTimer();
      this.activateWaveAnimation();
    });
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

  setHeight() {
    const firstElement = this.el.nativeElement.querySelector('.js-first');
    const secondElement = this.el.nativeElement.querySelector('.js-second');
    const thirdElement = this.el.nativeElement.querySelector('.js-third');
  
    this.renderer.setStyle(firstElement, 'height', '8px');
    this.renderer.setStyle(secondElement, 'height', '16px');
    this.renderer.setStyle(thirdElement, 'height', '8px');
  }

  activateWaveAnimation() {
    setInterval(() => this.setHeight(), 200);
  }

  loadInterviewData() {
    this.data.getInterviewData(this.interviewId).subscribe(data => {
      this.interviewData = data;
      this.nameCandidate = data.name;
      console.log(this.interviewData);
      this.playQuestionAndRecord();
    }, error => {
      console.error('Error al cargar los datos de la entrevista', error);
    });
  }

  playQuestionAndRecord() {
    this.isUserTurn = false;
    this.cdr.detectChanges(); // Forzar detección de cambios

    const questionText = this.interviewData.questions.questions[this.currentQuestionIndex].question;
    this.data.generateAudio(questionText).subscribe((audioBlob) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        this.startRecording();
      };
    }, error => {
      console.error('Error al generar el audio', error);
    });
  }

  startRecording() {
    this.isUserTurn = true;
    this.cdr.detectChanges(); // Forzar detección de cambios
    this.audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new (window as any).MediaRecorder(stream);
      this.mediaRecorder.start();

      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingStop();
      };
    }).catch(error => {
      console.error('Error al acceder al micrófono', error);
      this.isUserTurn = false;
      this.cdr.detectChanges(); // Forzar detección de cambios en caso de error
    });
  }

  handleRecordingStop() {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });

    this.data.uploadAudio(audioBlob, this.interviewId, this.currentQuestionIndex).subscribe(
      (response) => {
        console.log('Audio subido con éxito', response);
        this.nextQuestion();
      },
      (error) => {
        console.error('Error al subir el audio', error);
        this.isUserTurn = true; // permitir reintento o dar control al usuario
        this.cdr.detectChanges(); // Forzar detección de cambios en caso de error
      }
    );
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.isUserTurn = false;
      this.cdr.detectChanges(); // Forzar detección de cambios
      this.mediaRecorder.stop();
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.interviewData.questions.questions.length - 1) {
      this.currentQuestionIndex++;
      this.playQuestionAndRecord();
    } else {
      console.log("Se terminó la entrevista");
      this.completeInterview();
    }
  }

  completeInterview() {
    this.data.completedInterview(this.interviewData.author, this.interviewData.templateId, this.interviewId).subscribe(
      (res) => {
        console.log('Entrevista completada con éxito', res);
      },
      (error) => {
        console.error('Error al completar la entrevista', error);
      }
    );
  }
}
