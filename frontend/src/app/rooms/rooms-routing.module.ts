import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomDetailComponent } from './room-detail/room-detail.component';

const roomRoutes: Routes = [
  { path: 'rooms', component: RoomListComponent, data: { animation: 'rooms' }  },
  { path: 'room/:id', component: RoomDetailComponent, data: { animation: 'room' }  },
];

@NgModule({
  imports: [RouterModule.forChild(roomRoutes)],
  exports: [RouterModule]
})
export class RoomsRoutingModule { }
