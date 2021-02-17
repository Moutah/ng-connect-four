import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './views/game/game.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { GridComponent } from './components/grid/grid.component';
import { CellComponent } from './components/cell/cell.component';
import { TimerComponent } from './components/timer/timer.component';

@NgModule({
  declarations: [AppComponent, GameComponent, GridComponent, CellComponent, TimerComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
