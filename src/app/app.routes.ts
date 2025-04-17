import { Routes } from '@angular/router';
import { AudioComponent } from './components/audio/audio.component';
import { SimpleRecorderComponent } from './components/simple-recorder/simple-recorder.component';

export const routes: Routes = [
  { path: '', component: AudioComponent },
  { path: 'record', component: SimpleRecorderComponent },
];
