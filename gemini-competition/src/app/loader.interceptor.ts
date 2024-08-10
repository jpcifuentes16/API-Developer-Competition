import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from './loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No mostrar el loader si la URL contiene 'interview'
    if (!req.url.includes('/interview/')) {
      this.loaderService.show();
    }

    return next.handle(req).pipe(
      finalize(() => this.loaderService.hide())
    );
  }
}
