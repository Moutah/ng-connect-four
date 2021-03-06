import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Player } from './player';
import { GameComponent } from './game.component';
import { GameService } from './services/game.service';
import * as Game from './state/actions';
import { GameState } from './state';
import { NgxsModule, Store } from '@ngxs/store';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AiService } from './services/ai.service';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const gameServiceStub = {
  clear: () => {},
};
const aiServiceStub = {
  awake: () => {},
};

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let store: Store;

  /**
   * Hijack given `observableName` observable in `component` and give it given
   * `value`.
   */
  const simulateObservatorValue = (observableName: string, value: any) => {
    Object.defineProperty(component, observableName, { writable: true });
    component[observableName] = of(value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameComponent],
      imports: [FormsModule, NgxsModule.forRoot([GameState])],
      providers: [
        { provide: GameService, useValue: gameServiceStub },
        { provide: AiService, useValue: aiServiceStub },
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('awakes ai', () => {
    const aiAwakeSpy = spyOn(aiServiceStub, 'awake');

    // reboot component
    component.ngOnInit();
    expect(aiAwakeSpy).toHaveBeenCalled();
  });

  it('displays player setup if game not started', () => {
    const appPlayerSetupEl = fixture.nativeElement.querySelector(
      'app-player-setup'
    );
    expect(appPlayerSetupEl).toBeTruthy();
  });

  it('displays game if game started', () => {
    // set observables
    simulateObservatorValue('isGameStarted$', true);

    const gamePlayingEl = fixture.nativeElement.querySelector('.game__playing');
    expect(gamePlayingEl).toBeTruthy();
  });

  // TODO: leverage fakeAsync to make test synchronous
  it('calc offset based on game state', async () => {
    // start the game
    store.dispatch(new Game.Start());
    expect(component.timerOffset).toBe(0);

    await sleep(1000);

    // reboot component
    component.ngOnInit();
    expect(component.timerOffset).toBe(1);
  });

  // TODO: leverage fakeAsync to make test synchronous
  it('unveils game upon start', async () => {
    // initial state
    expect(component.isGridVeiled).toBe(true);
    expect(component.isGridUnveiled).toBe(false);

    // trigger observable
    store.dispatch(Game.Start);
    fixture.detectChanges();

    // unveil started
    await sleep(100);
    fixture.detectChanges();
    expect(component.isGridVeiled).toBe(false);
    expect(component.isGridUnveiled).toBe(false);

    // unveil finished after 1s
    await sleep(1000);
    fixture.detectChanges();
    expect(component.isGridVeiled).toBe(false);
    expect(component.isGridUnveiled).toBe(true);
  });

  it('displays active player if game started and not over', () => {
    // set observables
    simulateObservatorValue('isGameStarted$', true);
    simulateObservatorValue('isGameOver$', false);
    simulateObservatorValue('activePlayer$', new Player('p0', 'Ghost'));

    const gamePlayingStatusEl = fixture.nativeElement.querySelector(
      '.game__playing__status'
    );
    expect(gamePlayingStatusEl).toBeTruthy();
    expect(gamePlayingStatusEl.textContent.trim()).toBe(`Ghost is playing`);
  });

  it('displays winner if game was won', () => {
    // set observables
    simulateObservatorValue('isGameStarted$', true);
    simulateObservatorValue('isGameOver$', true);
    simulateObservatorValue('winner$', new Player('p0', 'Ghost'));

    const gamePlayingStatusEl = fixture.nativeElement.querySelector(
      '.game__playing__status'
    );
    expect(gamePlayingStatusEl).toBeTruthy();
    expect(gamePlayingStatusEl.textContent.trim()).toBe(`Ghost won!`);
  });

  it('displays draw if game over but was not won', () => {
    // set observables
    simulateObservatorValue('isGameStarted$', true);
    simulateObservatorValue('isGameOver$', true);
    simulateObservatorValue('winner$', undefined);

    const gamePlayingStatusEl = fixture.nativeElement.querySelector(
      '.game__playing__status'
    );
    expect(gamePlayingStatusEl).toBeTruthy();
    expect(gamePlayingStatusEl.textContent.trim()).toBe(`Draw!`);
  });

  it('displays end game buttons if game was won', () => {
    // set observables
    simulateObservatorValue('isGameStarted$', true);
    simulateObservatorValue('isGameOver$', true);

    const gamePlayingExitEl = fixture.nativeElement.querySelector(
      '.game__playing__end-buttons'
    );
    expect(gamePlayingExitEl).toBeTruthy();
  });

  it('clears the game when clicking on new game button', () => {
    const gameClearSpy = spyOn(gameServiceStub, 'clear');

    // set observables
    simulateObservatorValue('isGameStarted$', true);
    simulateObservatorValue('isGameOver$', true);

    expect(gameClearSpy).not.toHaveBeenCalled();
    fixture.nativeElement
      .querySelectorAll('.game__playing__end-buttons__button')[0]
      .click();
    expect(gameClearSpy).toHaveBeenCalled();
  });

  it('clears the game when clicking on home button', () => {
    const gameClearSpy = spyOn(gameServiceStub, 'clear');

    // set observables
    simulateObservatorValue('isGameStarted$', true);
    simulateObservatorValue('isGameOver$', true);

    expect(gameClearSpy).not.toHaveBeenCalled();
    fixture.nativeElement
      .querySelectorAll('.game__playing__end-buttons__button')[1]
      .click();
    expect(gameClearSpy).toHaveBeenCalled();
  });
});
