import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { gsap } from 'gsap';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/interfaces/app-state.interface';
import { loadingStore } from 'src/app/store/selectors/loading.selector';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss']
})
export class LoadingScreenComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('circlePurple')
  circlePurpleRef: ElementRef<HTMLDivElement>;
  circlePurple: HTMLDivElement;

  @ViewChild('circleGreen')
  circleGreenRef: ElementRef<HTMLDivElement>;
  circleGreen: HTMLDivElement;

  @ViewChild('circlePink')
  circlePinkRef: ElementRef<HTMLDivElement>;
  circlePink: HTMLDivElement;

  animationDuration: number;
  animationDelay: number;
  yPosition: number;

  isLoaded: boolean;

  store$: Subscription;

  constructor(private store: Store<AppState>) {
    this.circlePurpleRef = {} as ElementRef<HTMLDivElement>;
    this.circlePurple = {} as HTMLDivElement;
    this.circleGreenRef = {} as ElementRef<HTMLDivElement>;
    this.circleGreen = {} as HTMLDivElement;
    this.circlePinkRef = {} as ElementRef<HTMLDivElement>;
    this.circlePink = {} as HTMLDivElement;
    this.animationDuration = 0.5;
    this.animationDelay = 0.1;
    this.yPosition = 25;
    this.isLoaded = false;
    this.store$ = {} as Subscription;
  }

  ngOnInit(): void {
    this.store$ = this.store.select(loadingStore).subscribe((state: boolean): boolean => this.isLoaded = state);
  }

  ngAfterViewInit(): void {
    if (!this.isLoaded) {
      this.circlePurple = this.circlePurpleRef.nativeElement;
      this.circleGreen = this.circleGreenRef.nativeElement;
      this.circlePink = this.circlePinkRef.nativeElement;

      const targets: HTMLDivElement[] = [
        this.circlePurple,
        this.circleGreen,
        this.circlePink
      ];

      targets.forEach((target) => {
        this.bounceAnim(target);
        this.animationDelay += 0.2;
      });
    }
  }

  ngOnDestroy(): void {
    this.store$.unsubscribe();
  }

  bounceAnim(target: HTMLDivElement): void {
    gsap.to(target, {
      ease: 'circ.inOut',
      y: this.yPosition,
      yoyo: true,
      yoyoEase: true,
      repeat: -1,
      duration: this.animationDuration,
      delay: this.animationDelay
    });
  }

}
