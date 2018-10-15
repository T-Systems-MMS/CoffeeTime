import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ChartComponent } from './chart.component';
import { FrameComponent } from './frame/frame.component';

@NgModule({
    declarations: [ChartComponent, FrameComponent],
    exports: [ChartComponent, FrameComponent],
    imports: [CommonModule, MatIconModule, MatToolbarModule, MatButtonModule]
})
export class ComponentModule { }
