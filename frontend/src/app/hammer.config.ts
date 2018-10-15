import { HammerGestureConfig } from '@angular/platform-browser';

export class HammerConfig extends HammerGestureConfig {
    options = {
        touchAction: 'pan-y'
    }
}