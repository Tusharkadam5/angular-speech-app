import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import RecordRTC from 'recordrtc';
@Component({
  selector: 'app-audio',
  standalone: true,
  imports: [],
  templateUrl: './audio.component.html',
  styleUrl: './audio.component.scss',
})
export class AudioComponent {
  private recorder!: RecordRTC;
  private websocket!: WebSocketSubject<any>;
  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private silenceTimer: any;
  private isRecording = false;

  ngOnInit() {
    this.websocket = new WebSocketSubject('ws://localhost:8080');
    //this.setupRecording();
  }

  async setupRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.recorder = new RecordRTC(stream, {
      type: 'audio',
      mimeType: 'audio/wav',
      timeSlice: 1000, // Send audio chunks every 1 second
      ondataavailable: (blob: any) => this.handleAudioChunk(blob),
    });

    // Initialize Web Audio API for VAD
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    source.connect(this.analyser);
    this.analyser.fftSize = 256;

    // Start VAD
    this.detectVoiceActivity();
  }

  private detectVoiceActivity() {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkVolume = () => {
      this.analyser.getByteFrequencyData(dataArray);
      const volume =
        dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

      if (volume > 20) {
        // Threshold for voice detection
        console.log('Speech detected');
        if (!this.isRecording) {
          this.recorder.startRecording();
          this.isRecording = true;
        }
        clearTimeout(this.silenceTimer);
      } else if (this.isRecording) {
        console.log('Silence detected');
        this.silenceTimer = setTimeout(() => {
          this.recorder.stopRecording();
          this.websocket.next({ action: 'end' }); // Signal end of audio
          this.isRecording = false;
        }, 3000); // Stop after 3 seconds of silence
      }

      requestAnimationFrame(checkVolume);
    };

    checkVolume();
  }

  private handleAudioChunk(blob: Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      const audioData = reader.result as ArrayBuffer;
      this.websocket.next({ action: 'audio', data: audioData });
    };
    reader.readAsArrayBuffer(blob);
  }
}
