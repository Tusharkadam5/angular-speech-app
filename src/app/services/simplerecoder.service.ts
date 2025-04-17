import { Injectable } from '@angular/core';
import RecordRTC from 'recordrtc';

@Injectable({
  providedIn: 'root',
})
export class SimplerecoderService {
  private recorder: RecordRTC | null = null;
  public ws: WebSocket = new WebSocket('ws://localhost:8080');
  private audioContext = new AudioContext({ sampleRate: 16000 });

  constructor() {
    this.ws.binaryType = 'arraybuffer';
  }
  async startRecording() {
    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Use Web Audio API to resample to 16 kHz
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(stream);
      const destination = this.audioContext.createMediaStreamDestination();
      source.connect(destination);

      // Configure RecordRTC for 16 kHz WAV
      this.recorder = new RecordRTC(destination.stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1, // Mono
        desiredSampRate: 16000, // Ensure 16 kHz output
      });

      // Start recording
      this.recorder.startRecording();
      console.log('Recording started with sample rate 16 kHz');
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }

  async stopRecording() {
    if (this.recorder && this.ws.readyState === WebSocket.OPEN) {
      this.recorder.stopRecording(() => {
        const blob = this.recorder!.getBlob();
        console.log('Recording stopped, blob size:', blob.size);

        // Send WAV file as binary
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          this.ws.send(arrayBuffer);
          this.ws.send(JSON.stringify({ action: 'end' }));
          // Do not close immediately; let orchestrator handle session
          // setTimeout(() => this.ws.close(), 1000); // Removed to keep connection open
        };
        reader.readAsArrayBuffer(blob);

        // Clean up recorder but keep WebSocket open
        this.recorder!.destroy();
        this.recorder = null;
      });
    } else {
      console.error('Cannot stop recording: recorder or WebSocket not ready');
    }
  }

  async palyAudios(event: { data: Blob | ArrayBuffer }) {
    try {
      let arrayBuffer: ArrayBuffer;
      if (event.data instanceof Blob) {
        arrayBuffer = await event.data.arrayBuffer();
      } else {
        arrayBuffer = event.data;
      }
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
      console.log('Playing audio chunk');
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }
}

// import { Injectable } from '@angular/core';
// import RecordRTC from 'recordrtc';

// @Injectable({
//   providedIn: 'root',
// })
// export class SimplerecoderService {
//   private recorder: RecordRTC | null = null;
//   public ws: WebSocket = new WebSocket('ws://localhost:8080');

//   async startRecording() {
//     try {
//       // Initialize WebSocket
//       // this.ws = new WebSocket('ws://localhost:8080');
//       this.ws.onopen = () => console.log('WebSocket connection established');
//       this.ws.onerror = (error) => console.error('WebSocket error:', error);

//       // Get audio stream
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//       // Use Web Audio API to resample to 16 kHz
//       const audioContext = new AudioContext({ sampleRate: 16000 });
//       const source = audioContext.createMediaStreamSource(stream);
//       const destination = audioContext.createMediaStreamDestination();
//       source.connect(destination);

//       // Configure RecordRTC for 16 kHz WAV
//       this.recorder = new RecordRTC(destination.stream, {
//         type: 'audio',
//         mimeType: 'audio/wav',
//         recorderType: RecordRTC.StereoAudioRecorder,
//         numberOfAudioChannels: 1, // Mono
//         desiredSampRate: 16000, // Ensure 16 kHz output
//       });

//       // Start recording
//       this.recorder.startRecording();
//       console.log('Recording started with sample rate 16 kHz');
//     } catch (err) {
//       console.error('Error accessing microphone:', err);
//     }
//   }

//   async stopRecording() {
//     if (this.recorder && this.ws?.readyState === WebSocket.OPEN) {
//       this.recorder.stopRecording(() => {
//         const blob = this.recorder!.getBlob();
//         console.log('Recording stopped, blob size:', blob.size);

//         // Send WAV file as binary
//         const reader = new FileReader();
//         reader.onload = () => {
//           const arrayBuffer = reader.result as ArrayBuffer;
//           this.ws!.send(arrayBuffer);
//           this.ws!.send(JSON.stringify({ action: 'end' }));
//           setTimeout(() => this.ws!.close(), 1000);
//         };
//         reader.readAsArrayBuffer(blob);

//         // Clean up
//         this.recorder!.destroy();
//         this.recorder = null;
//       });
//     }
//   }
// }
