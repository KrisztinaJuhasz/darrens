import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { gsap } from 'gsap';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav-item',
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent implements OnInit, AfterViewInit {

  @Input('name')
  name: string;
  
  @Input('link')
  link: string;
  location: string;

  @ViewChild('line')
  lineRef: ElementRef<SVGElement>;
  line: SVGElement;

  constructor(private router: Router, private locationService: Location) {
    this.name = '';
    this.link = '/';
    this.location = locationService.path();
    this.lineRef = {} as ElementRef<SVGElement>;
    this.line = {} as SVGElement;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.line = this.lineRef.nativeElement;

    this.router.events.pipe(filter((event: Event): boolean => event instanceof NavigationEnd)).subscribe((): void => {
      this.location = this.locationService.path();
      
      if (this.location === '') {
        this.location = '/';
      }

      this.setActiveLine();
    });
  }

  setActiveLine(): void {
    if (this.location === this.link) {
      gsap.to(this.line, { duration: 0.5, attr: { x2: 200 } });
    } else {
      this.hideLine();
    }
  }

  showLine(): void {
    if (this.location !== this.link) {
      gsap.to(this.line, { duration: 0.5, attr: { x2: 200 }});
    }
  }
  
  hideLine(): void {
    if (this.location !== this.link) {
      gsap.to(this.line, { duration: 0.5, attr: { x2: 0 }});
    }
  }

}
