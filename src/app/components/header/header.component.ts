import { Component, OnInit } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  animateContent(): void {
    gsap.fromTo('.content-wrapper', {
      opacity: 0
    }, {
      opacity: 1,
      duration: 1
    });
  }

}
