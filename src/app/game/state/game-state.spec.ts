import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { Player } from 'src/app/shared/player';
import { GameState } from '.';
import * as Game from './actions';

describe('GameState', () => {
  let store: Store;
  let players: Player[];

  /**
   * Get the active player from the game state.
   */
  const getActivePlayer = () =>
    store.selectSnapshot((state) => state.game.activePlayer);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([GameState])],
    });

    store = TestBed.inject(Store);
    players = [new Player('p1', 'Batman'), new Player('p2', 'Superman')];
  });

  it('can set players', () => {
    store.dispatch(new Game.SetPlayers(players[0], players[1]));

    const gamePlayers = store.selectSnapshot((state) => state.game.players);
    expect(gamePlayers).toEqual([players[0], players[1]]);
  });

  it('can start the game with either players', () => {
    // init
    store.dispatch(new Game.SetPlayers(players[0], players[1]));

    // start the game
    store.dispatch(new Game.Start());

    // game is started
    const isGameOver = store.selectSnapshot((state) => state.game.isOver);
    expect(isGameOver).toBe(false);

    // game is started with correct player
    expect(getActivePlayer()).toEqual(players[0]);

    // start with another player
    store.dispatch(new Game.Start());

    // game is started with correct player
    expect(getActivePlayer()).toEqual(players[1]);
  });

  it('can stop the game', () => {
    store.dispatch(new Game.End());

    const isGameOver = store.selectSnapshot((state) => state.game.isOver);
    expect(isGameOver).toBe(true);
  });

  it('can switch palyers turn', () => {
    // init
    store.dispatch(new Game.SetPlayers(players[0], players[1]));
    store.dispatch(new Game.Start());

    // player 2's turn
    store.dispatch(new Game.NextPlayer());
    expect(getActivePlayer()).toEqual(players[1]);

    // back to player 1
    store.dispatch(new Game.NextPlayer());
    expect(getActivePlayer()).toEqual(players[0]);
  });
});
