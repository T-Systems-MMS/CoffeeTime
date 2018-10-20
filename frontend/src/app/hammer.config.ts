import { HammerGestureConfig } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

@Injectable()
export class HammerConfig extends HammerGestureConfig {
    options = {
        touchAction: 'pan-y'
    };
}
