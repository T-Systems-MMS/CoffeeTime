import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoomsRoutingModule } from './rooms-routing.module';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomComponent } from './room/room.component';
import { RoomService } from './room.service';
import { RoomDetailComponent } from './room-detail/room-detail.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { PushService } from './push.service';

@NgModule({
  declarations: [
    RoomComponent,
    RoomListComponent,
    RoomDetailComponent
  ],
  imports: [
    CommonModule,
    RoomsRoutingModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatGridListModule
  ],
  providers: [
    RoomService, PushService
  ]
})
export class RoomsModule { }
