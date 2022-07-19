import { Component, ElementRef, OnInit, ViewChild, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { gsap } from 'gsap';
import { Store } from '@ngrx/store';
import * as LoadingActions from '../../store/actions/loading.action';
import { AppState } from 'src/app/interfaces/app-state.interface';
import { loadingStore } from 'src/app/store/selectors/loading.selector';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { mergeMap, switchMap, take, takeUntil } from 'rxjs/operators';

interface ClientPosition {
  x: number;
  y: number;
}

interface EventType {
  mouse: string;
  touch: string;
}

interface EventTypes {
  move: EventType;
  down: EventType;
  up: EventType;
}

@Component({
  selector: 'app-logo-render',
  templateUrl: './logo-render.component.html',
  styleUrls: ['./logo-render.component.scss']
})
export class LogoRenderComponent implements OnInit, AfterViewInit, OnDestroy {

  canvasWidth: number;
  canvasHeight: number;
  @ViewChild('canvas')
  canvasRef: ElementRef<HTMLCanvasElement>;
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  cameraPosition: THREE.Vector3;
  scene: THREE.Scene;
  composer: EffectComposer;
  previousScrollPosition: number;
  logoMesh: THREE.Group;
  bgPlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  meshGroup: THREE.Group;
  isLoaded: boolean;
  store$: Subscription;
  initialMeshGroupRotation: THREE.Euler;
  eventType: EventTypes;

  constructor(private ngZone: NgZone, private store: Store<AppState>) {
    if (window.innerWidth < 700) {
      this.canvasWidth = window.innerWidth;
    } else {
      this.canvasWidth = window.innerWidth / 3;
    }
    this.canvasHeight = this.canvasWidth;
    this.canvasRef = {} as ElementRef<HTMLCanvasElement>;
    this.canvas = {} as HTMLCanvasElement;
    this.renderer = {} as THREE.WebGLRenderer;
    this.camera = {} as THREE.PerspectiveCamera;
    this.cameraPosition = new THREE.Vector3(0, 0, 3);
    this.scene = {} as THREE.Scene;
    this.composer = {} as EffectComposer;
    this.previousScrollPosition = 0;
    this.logoMesh = {} as THREE.Group;
    this.bgPlane = {} as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
    this.meshGroup = {} as THREE.Group;
    this.isLoaded = false;
    this.store$ = {} as Subscription;
    this.initialMeshGroupRotation = new THREE.Euler(0, 0, 0);
    this.eventType = {
      move: {
        mouse: 'mousemove',
        touch: 'touchmove'
      },
      down: {
        mouse: 'mousedown',
        touch: 'touchstart'
      },
      up: {
        mouse: 'mouseup',
        touch: 'touchend'
      }
    };
  }

  ngOnInit(): void {
    gsap.config({ nullTargetWarn: false });
  }

  ngAfterViewInit(): void {
    this.createScene(this.canvasRef);
    this.animate();
  }

  ngOnDestroy(): void {
    this.store$.unsubscribe();
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.canvasWidth, this.canvasHeight);
  
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.canvasWidth / this.canvasHeight, 0.1, 1000);
    this.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
    this.scene.add(this.camera);

    const ambientLight: THREE.AmbientLight = new THREE.AmbientLight();
    ambientLight.position.z = 10;
    this.scene.add(ambientLight);

    const dirLight: THREE.DirectionalLight = new THREE.DirectionalLight();
    dirLight.position.z = 5;
    dirLight.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(dirLight);

    const backLight: THREE.DirectionalLight = new THREE.DirectionalLight();
    backLight.position.z = -5;
    backLight.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(backLight);

    this.renderer.physicallyCorrectLights = true;

    this.composer = new EffectComposer(this.renderer);
    const renderPass: RenderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.meshGroup = new THREE.Group();
    
    const glTFLoader: GLTFLoader = new GLTFLoader();
    glTFLoader.load('assets/logo.gltf', (gltf) => {
      this.logoMesh = gltf.scene;
      this.logoMesh.lookAt(this.cameraPosition);
      this.meshGroup.add(this.logoMesh);
      this.store.dispatch(LoadingActions.finishLoading({ payload: true }));
    }, undefined, (err) => console.error(err));

    const bgPlaneGeo: THREE.PlaneGeometry = new THREE.PlaneGeometry(3.5, 3.5);
    const bgPlaneTexture: THREE.Texture = new THREE.TextureLoader().load('assets/logo_lights.png');
    const bgPlaneMat: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({ map: bgPlaneTexture, transparent: true });
    bgPlaneMat.side = THREE.DoubleSide;
    this.bgPlane = new THREE.Mesh(bgPlaneGeo, bgPlaneMat);
    this.bgPlane.lookAt(this.cameraPosition);
    this.meshGroup.add(this.bgPlane);
    
    this.scene.add(this.meshGroup);
  }

  animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        fromEvent<Event>(window, 'DOMContentLoaded').subscribe((): void => this.render());
      }

      fromEvent<Event>(window, 'scroll').subscribe((): void => this.scroll());
      fromEvent<Event>(window, 'resize').subscribe((): void => this.resize());
      
      const mouseMove$ = fromEvent<MouseEvent>(document, this.eventType.move.mouse);
      const mouseDown$ = fromEvent<MouseEvent>(this.canvas, this.eventType.down.mouse);
      const mouseUp$ = fromEvent<MouseEvent>(document, this.eventType.up.mouse);

      const touchMove$ = fromEvent<TouchEvent>(document, this.eventType.move.touch);
      const touchStart$ = fromEvent<TouchEvent>(this.canvas, this.eventType.down.touch);
      const touchEnd$ = fromEvent<TouchEvent>(document, this.eventType.up.touch);

      this.buildObservables(mouseMove$, mouseDown$, mouseUp$);
      this.buildObservables(touchMove$, touchStart$, touchEnd$);
    });
  }

  buildObservables(move$: Observable<MouseEvent | TouchEvent>, down$: Observable<MouseEvent | TouchEvent>, up$: Observable<MouseEvent | TouchEvent>): void {
    down$.subscribe((event: (MouseEvent | TouchEvent)) => event.preventDefault());

    const dragLogo$: Observable<MouseEvent | TouchEvent> = down$.pipe(mergeMap(() => move$.pipe(takeUntil(up$))));
    dragLogo$.subscribe((event: (MouseEvent | TouchEvent)) => this.dragLogo(event));

    const releaseLogo$: Observable<MouseEvent | TouchEvent> = down$.pipe(switchMap(() => up$.pipe(take(1))));
    releaseLogo$.subscribe((event: (MouseEvent | TouchEvent)) => this.rotateBack(event, this.meshGroup.rotation));
  }

  render(): void {
    requestAnimationFrame(this.render.bind(this));

    this.store$ = this.store.select(loadingStore).subscribe((state: boolean): void => {
      if (state) {
        requestAnimationFrame((t: number): void => this.animateLogo(t));
      }
    });

    this.composer.render();
  }

  resize(): void {
    const width: number = this.canvasWidth;
    const height: number = this.canvasHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  scroll(): void {
    const newScrollPosition: number = scrollY;

    if (this.previousScrollPosition < newScrollPosition) {
      gsap.to('canvas', { y: -10, duration: 1 });
    } else if (this.previousScrollPosition > newScrollPosition) {
      gsap.to('canvas', { y: 0, duration: 1 });
    }

    this.previousScrollPosition = scrollY;
  }

  dragLogo(event: (MouseEvent | TouchEvent)): void {
    const dragMultiplier: number = 0.000001;
    const clientPositions: ClientPosition = this.getClientPos(event);
    let initialClientX: number = clientPositions.x;
    let initialClientY: number = clientPositions.y;
    let previousClientX: number = initialClientX;
    let previousClientY: number = initialClientY;

    fromEvent<typeof event>(document, this.getEvent(event, this.eventType.move))
      .pipe(
        takeUntil(
          fromEvent<typeof event>(document, this.getEvent(event, this.eventType.up))
        )
      )
      .subscribe((e: (MouseEvent | TouchEvent)) => {
        const currentClientPositions: ClientPosition = this.getClientPos(e);

        if (previousClientX <= currentClientPositions.x) {
          this.meshGroup.rotation.y += clientPositions.x * dragMultiplier;
        } else {
          this.meshGroup.rotation.y -= clientPositions.x * dragMultiplier;
        }

        if (previousClientY <= currentClientPositions.y) {
          this.meshGroup.rotation.x += clientPositions.y * dragMultiplier;
        } else {
          this.meshGroup.rotation.x -= clientPositions.y * dragMultiplier
        }

        previousClientX = currentClientPositions.x;
        previousClientY = currentClientPositions.y;
      });
  }

  getClientPos(event: (MouseEvent | TouchEvent)): ClientPosition {
    let clientPosition: ClientPosition = {
      x: 0,
      y: 0
    };

    if (event instanceof MouseEvent) {
      clientPosition.x = event.clientX;
      clientPosition.y = event.clientY;
    } else if (event instanceof TouchEvent) {
      clientPosition.x = event.touches[0].clientX;
      clientPosition.y = event.touches[0].clientY;
    }

    return clientPosition;
  }

  getEvent(event: (MouseEvent | TouchEvent), e: EventType): string {
    const isDesktop: boolean = (event instanceof MouseEvent);
    
    switch (e) {
      case this.eventType.move:
        return isDesktop ? this.eventType.move.mouse : this.eventType.move.touch;
      case this.eventType.down:
        return isDesktop ? this.eventType.down.mouse : this.eventType.down.touch;
      case this.eventType.up:
        return isDesktop ? this.eventType.up.mouse : this.eventType.up.touch;
      default:
        return '';
    }
  }

  animateLogo(t: number): void {
    const timeDivider: number = 1000;
    const pathDivider: number = 20;

    this.logoMesh.position.setX(Math.sin(t / timeDivider) / pathDivider);
    this.logoMesh.position.setY(Math.cos(t / timeDivider) / pathDivider);
  }

  rotateBack(event: (MouseEvent | TouchEvent), rotation: THREE.Euler): void {
    const animationDuration: number = 5;
    const rotationTween: gsap.core.Tween = gsap.to(this.meshGroup.rotation, {
      x: this.initialMeshGroupRotation.x,
      y: this.initialMeshGroupRotation.y,
      z: this.initialMeshGroupRotation.z,
      duration: animationDuration
    });

    if (this.isLogoRotated(rotation)) {
      rotationTween.play();
      fromEvent<typeof event>(this.canvas, this.getEvent(event, this.eventType.down)).subscribe(() => rotationTween.kill());
    }
  }

  isLogoRotated(logoRotationCoordinates: THREE.Euler): boolean {
    let isRotated: boolean = false;

    if (
      logoRotationCoordinates.x === this.initialMeshGroupRotation.x &&
      logoRotationCoordinates.y === this.initialMeshGroupRotation.y &&
      logoRotationCoordinates.z === this.initialMeshGroupRotation.z
    ) {
      isRotated = false;
    } else {
      isRotated = true;
    }

    return isRotated;
  }

}
