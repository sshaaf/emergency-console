import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message/message.service';
import { KeycloakService } from 'keycloak-angular';
import { Responder } from './responder';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser, faShip, faPhone, faBriefcaseMedical } from '@fortawesome/free-solid-svg-icons';
import { MapMouseEvent, LngLatBoundsLike } from 'mapbox-gl';
import { MissionService } from './mission.service';
import { LineString } from 'geojson';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.css']
})
export class MissionComponent implements OnInit {
  model: Responder;
  center: number[];
  userIcon: IconDefinition;
  boatIcon: IconDefinition;
  phoneIcon: IconDefinition;
  medicalIcon: IconDefinition;
  start: number[];
  end: number[];
  bounds: LngLatBoundsLike;
  boundsOptions: any;
  directions: LineString;
  accessToken: string;

  constructor(private messageService: MessageService, private keycloak: KeycloakService, private missionService: MissionService) {
    this.model = new Responder();
    this.center = [-77.886765, 34.210383];
    this.userIcon = faUser;
    this.boatIcon = faShip;
    this.phoneIcon = faPhone;
    this.medicalIcon = faBriefcaseMedical;
    this.start = new Array();
    this.end = new Array();
    this.boundsOptions = {
      padding: 100
    };
    this.accessToken = window['_env'].accessToken;
  }

  submit(): void {
    this.messageService.info('You are now available to receive a rescue mission');
    this.end = [-77.94346099447226, 34.21828123440535];
    this.directions = null;

    this.missionService.getDirections(this.start, this.end).subscribe(res => {
      this.directions = res.routes[0].geometry;
      this.bounds = [this.start[0], this.start[1], this.end[0], this.end[1]];
    });
  }

  setLocation(event: MapMouseEvent): void {
    if (event.lngLat) {
      this.start = [event.lngLat.lng, event.lngLat.lat];
    }
  }

  ngOnInit() {
    this.keycloak.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.keycloak.loadUserProfile().then(profile => {
          this.model.fullName = `${profile.firstName} ${profile.lastName}`;
          this.model.phoneNumber = profile['attributes'].phoneNumber;
          this.model.boatCapacity = profile['attributes'].boatCapacity;
          this.model.medical = profile['attributes'].medical;
        });
      }
    });
  }
}
