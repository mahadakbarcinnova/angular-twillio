import { Component, OnInit } from '@angular/core';
import { TwillioService } from './twilio.service';
import * as Video from 'twilio-video';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  username : string = "";
  remoteUserName : string = "";
  roomName : string = "";
  tokenRes :any;
  accessToken : string = ""
  room : any;
  audioOutputDevice: any;

  constructor(private twilioService: TwillioService) { }



  ngOnInit() {
    this.addLocalVideo();
  }
  

  async addLocalVideo() {
    const videoTrack = await Video.createLocalVideoTrack();
    console.log('video track', videoTrack);
    const trackElement = videoTrack.attach();
    document.getElementById('localParticipant')?.appendChild(trackElement);
    
  }
  
  // end(){}

 async call() {
    console.log(this.username);
    console.log(this.roomName);

    const TokenResponse = this.twilioService.getToken("Mahad", "room")
    this.tokenRes = await lastValueFrom(TokenResponse)
    console.log(this.tokenRes, "ress");
    
    this.accessToken = this.tokenRes?.token
    console.log(this.accessToken, "token");
    
    this.connectToRoom();
  }

  connectParticipants(participant: any) {
    participant.tracks.forEach((publication: any) => {
      if (publication.isSubscribed) {
        const track = publication.track;
        if (track.kind === 'video') {
          document
            .getElementById('remoteParticipant')
            ?.appendChild(track.attach());
        }
      }
    });
    participant.on('trackSubscribed', (track :any ) => {
      if (track.kind === 'audio') {
        const audioElement = track.attach();
      audioElement.setSinkId(this.audioOutputDevice.deviceId).then(() => {
        document
        .getElementById('remoteParticipant')
        ?.appendChild(track.attach());
      });
       
      }
      if (track.kind === 'video') {
        document
          .getElementById('remoteParticipant')
          ?.appendChild(track.attach());
      }
    });
  }


  end() {
    console.log('click on end');
    this.room.on('disconnected', (room: any) => {
      // Detach the local media elements
      room.localParticipant.tracks.forEach((publication: any) => {
        const track = publication.track;
        if (track.kind === 'video') {
          // document.getElementById('remoteParticipant').innerHTML = '';
          // const attachedElements = publication.track.detach();
          // attachedElements.forEach((element) => element.remove());
        }
      });
    });
    // To disconnect from a Room
    this.room.disconnect();
  }



  async connectToRoom() {
    let options = {
      name: this.roomName,
      audio: true,
      video: true,
    };
    navigator.mediaDevices.enumerateDevices().then(devices => {
      this.audioOutputDevice = devices.find(device => device.kind === 'audiooutput');
    })
    
    await Video.connect(this.accessToken, options).then(
      (room) => {
        console.log(`Successfully joined a Room: ${room}`);
        this.room = room;
        room.on('participantConnected', (participant) => {
          console.log(`A remote Participant connected: ${participant}`);
        });
      },
      (error) => {
        console.error(`Unable to connect to Room: ${error.message}`);
      }
    );

    const localParticipant = this.room.localParticipant;
    console.log(
      `Connected to the Room as LocalParticipant "${localParticipant.identity}"`
    );


    // This function will join or make the call, for remote participant
    this.room.participants.forEach((participant: any) => {
      console.log(
        `Participant "${participant.identity}" is connected to the Room`
      );
      this.remoteUserName = participant.identity;
      this.connectParticipants(participant);
    });
    console.log(this.room, 'roommmm');

    // This function will join or make the call, for local participant

    // Attach the Participant's Media to a <div> element.
    this.room.on('participantConnected', (participant: any) => {
      console.log(`Participant "${participant.identity}" connected`);
      this.remoteUserName = participant.identity;
      this.connectParticipants(participant);
    });
  }



}