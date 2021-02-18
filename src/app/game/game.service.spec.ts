import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { NgxsModule, Store } from '@ngxs/store';
import { GameState } from './state';
import { GridState } from '../grid/state';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { Observable, zip } from 'rxjs';
import { Reset } from '../grid/state/actions/Reset.action';
import { Start } from './state/actions/Start.action';
import { End } from './state/actions/End.action';
import { PlayCoin } from '../grid/state/actions/PlayCoin.action';
import { NextPlayer } from './state/actions/NextPlayer.action';
import { environment } from 'src/environments/environment';
import { Player } from '../shared/models/player';

describe('GameService', () => {
  let service: GameService;
  let store: Store;
  let players: Player[];
  let actions$: Observable<any>;

  // /**
  //  * Get the active player from the game state.
  //  */
  // const getActivePlayer = () =>
  //   store.selectSnapshot((state) => state.game.activePlayer);

  // /**
  //  * Get the grid columms from the grid state.
  //  */
  // const getGridCols = () => store.selectSnapshot((state) => state.grid.cols);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([GameState, GridState])],
    });

    store = TestBed.inject(Store);
    service = TestBed.inject(GameService);
    actions$ = TestBed.inject(Actions);
    players = [new Player('p1', 'Batman'), new Player('p2', 'Superman')];
    service.setup(players[0], players[1]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can start the game', (done) => {
    // define expected actions
    zip(
      actions$.pipe(ofActionDispatched(Reset)),
      actions$.pipe(ofActionDispatched(Start))
    ).subscribe((dispatchedActions) => {
      expect(dispatchedActions.length).toBe(2);
      done();
    });

    service.start(players[0]);
  });

  it('can stop the game', (done) => {
    // define expected actions
    zip(actions$.pipe(ofActionDispatched(End))).subscribe(
      (dispatchedActions) => {
        expect(dispatchedActions.length).toBe(1);
        done();
      }
    );

    service.end();
  });

  it('can play a coin', (done) => {
    // define expected actions
    actions$.pipe(ofActionDispatched(PlayCoin)).subscribe((payload) => {
      expect(payload.col).toBe(2);
    });
    zip(
      actions$.pipe(ofActionDispatched(PlayCoin)),
      actions$.pipe(ofActionDispatched(NextPlayer))
    ).subscribe((dispatchedActions) => {
      expect(dispatchedActions.length).toBe(2);
      done();
    });

    service.start(players[0]);
    service.play(2);
  });

  it('cannnot play a coin if game has not started', () => {
    expect(() => service.play(2)).toThrowError(
      '[Game Service] The game has not started, play() is not allowed.'
    );
  });

  it('cannnot play a coin if column is full', () => {
    // start the game and fill column 2
    service.start(players[0]);
    for (let i = 0; i < environment.gridRows; i++) {
      service.play(2);
    }

    // column 2 is full
    expect(() => service.play(2)).toThrowError(
      '[Game Service] Targeted column is full!'
    );
  });
});
