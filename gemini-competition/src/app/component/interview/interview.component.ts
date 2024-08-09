import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/shared/data.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';


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
    private el: ElementRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.interviewId = params.get('id')!;
      this.formattedId = this.formatId(this.interviewId);
      this.startTimer();
      this.activateWaveAnimation();

      // Iniciar la carga de los datos de la entrevista y la reproducción de las instrucciones simultáneamente
      this.loadInterviewData();
      this.playInstructionsAudio();
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

  playInstructionsAudio() {
    const instructionsAudio = new Audio('assets/audios/intro_EN.mp3');
    instructionsAudio.play();

    instructionsAudio.onended = () => {
      // Verificar si los audios de las preguntas ya están listos
      if (this.interviewData && this.interviewData.questions.questions[0].audioUrl) {
        this.playQuestionAndRecord(); // Iniciar la reproducción de la primera pregunta
      } else {
        // Esperar a que los audios estén listos si aún no lo están
        const checkInterval = setInterval(() => {
          if (this.interviewData && this.interviewData.questions.questions[0].audioUrl) {
            clearInterval(checkInterval);
            this.playQuestionAndRecord();
          }
        }, 100);
      }
    };
  }

  loadInterviewData() {
    this.data.getInterviewData(this.interviewId).subscribe(data => {
      this.interviewData = data;
      this.nameCandidate = data.name;
      console.log(this.interviewData);
      this.preloadAudios();
    }, error => {
      console.error('Error al cargar los datos de la entrevista', error);
    });
  }

  preloadAudios() {
    const questions = this.interviewData.questions.questions;
    const audioPromises = questions.map((question: any) =>
      this.data.generateAudio(question.question).toPromise()
    );
  
    Promise.all(audioPromises).then(audioBlobs => {
      audioBlobs.forEach((audioBlob, index) => {
        const audioUrl = URL.createObjectURL(audioBlob);
        questions[index].audioUrl = audioUrl;
      });
    }).catch(error => {
      console.error('Error al generar los audios', error);
    });
  }

  playQuestionAndRecord() {
    this.isUserTurn = false;
    this.cdr.detectChanges(); // Forzar detección de cambios
  
    const audioUrl = this.interviewData.questions.questions[this.currentQuestionIndex].audioUrl;
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => {
      this.startRecording();
    };
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



  playFarewellAudio() {
    const farewellAudio = new Audio('assets/audios/despedida_EN.mp3');
    farewellAudio.play();
  
    farewellAudio.onended = () => {
      this.router.navigate(['/farewell']);
    };
  }

  completeInterview() {
    this.data.completedInterview(this.interviewData.author, this.interviewData.templateId, this.interviewId).subscribe(
      (res) => {
        console.log('Entrevista completada con éxito', res);
        this.playFarewellAudio(); 
      },
      (error) => {
        console.error('Error al completar la entrevista', error);
      }
    );
  }
}
