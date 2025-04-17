import { Component, OnInit } from '@angular/core';
import { SimplerecoderService } from '../../services/simplerecoder.service';

@Component({
  selector: 'app-simple-recorder',
  standalone: true,
  imports: [],
  templateUrl: './simple-recorder.component.html',
  styleUrls: ['./simple-recorder.component.scss'], // Fixed typo: `styleUrl` -> `styleUrls`
})
export class SimpleRecorderComponent implements OnInit {
  isRecording = false;
  sessionId: string | null = null; // Store session ID

  constructor(private recorder: SimplerecoderService) {}

  ngOnInit(): void {
    this.recorder.ws.onopen = () => {
      console.log('WebSocket connection established');
    };
    this.recorder.ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        try {
          const response = JSON.parse(event.data);
          console.log('Response received:', response);
          if (response.action === 'session') {
            this.sessionId = response.sessionId;
            console.log('Assigned session ID:', this.sessionId);
          } else if (response.action === 'end') {
            console.log('Audio stream ended for session:', this.sessionId);
          }
        } catch (error) {
          console.error('Error parsing JSON message:', error);
        }
      } else {
        console.log('Binary audio chunk received for session:', this.sessionId);
        this.recorder.palyAudios({ data: event.data });
      }
    };

    // this.recorder.ws.onmessage = (event) => {
    //   const response = JSON.parse(event.data);
    //   console.log('Response received:', response);

    //   if (response.action === 'session') {
    //     this.sessionId = response.sessionId;
    //     console.log('Assigned session ID:', this.sessionId);
    //   } else if (
    //     response.action === 'audio' &&
    //     response.sessionId === this.sessionId
    //   ) {
    //     console.log('Audio received for session:', this.sessionId);
    //     //this.playAudio(response.data);
    //     this.recorder.palyAudios(response);
    //   } else {
    //     console.log('Payy audio...........:', this.sessionId);
    //     //this.playAudio(response.data);
    //     this.recorder.palyAudios(response);
    //   }
    // };

    this.recorder.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.recorder.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  start() {
    this.isRecording = true;
    this.recorder.startRecording();
  }

  stop() {
    this.isRecording = false;
    this.recorder.stopRecording();
  }

  private playAudio(base64Data: string) {
    console.log('Playing audio data, size:', base64Data.length);
    const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
    audio.play().catch((err) => console.error('Audio playback error:', err));
  }
}

// // recorder.component.ts
// import { Component, OnInit } from '@angular/core';
// import { SimplerecoderService } from '../../services/simplerecoder.service';

// @Component({
//   selector: 'app-simple-recorder',
//   standalone: true,
//   imports: [],
//   templateUrl: './simple-recorder.component.html',
//   styleUrl: './simple-recorder.component.scss',
// })
// export class SimpleRecorderComponent implements OnInit {
//   isRecording = false;

//   constructor(private recorder: SimplerecoderService) {}

//   ngOnInit(): void {
//     this.recorder.ws.onmessage = (event) => {
//       const response = JSON.parse(event.data);
//       console.log('response=====>', response);
//       if (response.action === 'audio') {
//         this.playAudio(response.data);
//       }
//     };
//   }

//   start() {
//     this.isRecording = true;
//     this.recorder.startRecording();
//   }

//   stop() {
//     this.isRecording = false;
//     this.recorder.stopRecording();
//   }

//   private playAudio(base64Data: any) {
//     console.log('audio data', base64Data);
//     const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
//     audio.play();
//   }
// }
