import { Injectable } from '@angular/core';
import { Action, State, StateContext, Store } from '@ngxs/store';
import { environment } from 'src/environments/environment';
import { Reset, PlayCoin } from './actions';

export interface GridStateModel {
  cols: string[][];
}

@State<GridStateModel>({
  name: 'grid',
  defaults: {
    cols: [],
  },
})
@Injectable()
export class GridState {
  /**
   * Marks the game as _not_ over.
   */
  @Action(Reset)
  resetGrid(ctx: StateContext<GridStateModel>): void {
    // generate empty cols
    const cols = [...Array(environment.gridCols).keys()].map(() => []);
    ctx.patchState({ cols });
  }

  /**
   * Marks the game as _not_ over.
   */
  @Action(PlayCoin)
  playCoin(ctx: StateContext<GridStateModel>, action: PlayCoin): void {
    // copy cols state
    const state = ctx.getState();
    const cols = [...state.cols];

    // add the coin to targeted column
    cols[action.col].push(action.player.id);

    // update state
    ctx.patchState({ cols });
  }
}
