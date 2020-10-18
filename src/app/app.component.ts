import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {fromEvent, interval, Observable, Subscription} from 'rxjs';
import {bufferCount, debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('startStop') startStopButton: ElementRef;
  @ViewChild('wait') waitButton: ElementRef;
  @ViewChild('reset') resetButton: ElementRef;

  hours = 0;
  minutes = 0;
  seconds = 0;

  isStarted = false;
  isStopped = true;
  isWaited = false;

  startStopClick: Observable<any>;
  waitClick: Observable<any>;
  resetClick: Observable<any>;

  clickCount = 0;

  sub: Subscription;

  ngAfterViewInit(): void {
    this.startStopClick = fromEvent(this.startStopButton.nativeElement, 'click');
    this.waitClick = fromEvent(this.waitButton.nativeElement, 'click')
      .pipe(
        debounceTime(300),
        bufferCount((2))
      );
    this.resetClick = fromEvent(this.resetButton.nativeElement, 'click');


    this.startStopClick.subscribe(() => {

      this.clickCount++;
      this.isStarted = !this.isStarted;
      this.isStopped = !this.isStopped;

      if (this.isStarted) {
        this.startStopFunc();
      }

      if (this.isStopped) {
        this.sub.unsubscribe();
      }
      if (this.isWaited && this.isStopped) {
        this.sub.unsubscribe();
      }

      if (this.isStarted && !this.isStopped) {
        this.isWaited = false;
      }

      if (!this.isStarted && this.isWaited) {
        this.clickCount = 0;
        this.isWaited = !this.isWaited;
        this.isStarted = !this.isStarted;
        this.clickCount++;
        this.startStopFunc();
      }
    });

    this.waitClick.subscribe((data) => {
      if (data && this.isStarted) {
        this.clickCount = 1;
        this.isWaited = !this.isWaited;
        this.isStopped = !this.isStopped;
        this.isStarted = !this.isStarted;
        this.sub.unsubscribe();
      }
    });

    this.resetClick.subscribe(() => {
      this.resetFunc();
    });
  }

  startStopFunc(): void {
    if (this.clickCount >= 3) {
      this.resetFunc();
      this.clickCount = 1;
      this.isStarted = !this.isStarted;
      this.isStopped = !this.isStopped;
    }

    this.sub = interval(1000).subscribe(() => {
      this.seconds++;
      if (this.seconds >= 60) {
        this.seconds = 0;
        this.minutes++;
      } else if (this.minutes >= 60) {
        this.minutes = 0;
        this.hours++;
      } else if (this.hours >= 24) {
        this.hours = 0;
      }
    });
  }

  resetFunc(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.clickCount = 0;
      this.isStopped = true;
      this.isStarted = false;
      this.isWaited = false;
      this.hours = this.minutes = this.seconds = 0;
    }
  }
}
