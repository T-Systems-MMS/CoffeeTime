import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameComponent } from './frame.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

describe('FrameComponent', () => {
    let component: FrameComponent;
    let fixture: ComponentFixture<FrameComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FrameComponent],
            imports: [MatIconModule, MatToolbarModule, MatProgressBarModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FrameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
