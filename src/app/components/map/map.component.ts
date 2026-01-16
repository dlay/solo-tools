import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MapData, MapMarker } from '../../models/map';
import { DatabaseService } from '../../services/database.service';
import { mapData, mapDataExtra } from '../../models/mapData';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  selectedMap: MapData | undefined;
  selectedSubMap: string | undefined;
  placementMode = false;
  controlMode = false;
  circleShown = false;
  isEditDescription = false;
  activeMarker: Array<MapMarker> = [];
  selectedMarker: MapMarker | undefined;
  markerFilter: Record<string, any> = {
    dungeon: true,
    hunt: true,
    fish: {},
    collectible: true,
    poi: true,
    treasure: true,
    monster: true,
    gather: {}
  };
  mapData: Array<MapData>;

  constructor(private db: DatabaseService, private auth: AuthService) {
    this.mapData = mapData;
  }
  isMapSelected = false;
  mapDefaultWidth = 0;
  mapDefaultHeight = 0;
  mapImgWidth = 0;
  mapImgHeight = 0;
  mapMaxWidth = 3840;
  mapMaxHeight = 2160;
  currentMarkerPosition = {
    left: 0,
    top: 0
  };

  escapeListener = (key: KeyboardEvent) => {
    if (key.key === 'Escape' && this.placementMode) {
      if (this.circleShown) {
        const circleElem = document.getElementById('placementCircle');
        if (circleElem) {
          circleElem.style.display = 'none';
        }
        this.circleShown = false;
      }
      this.placementModeStop();
    }
    if (key.key === 'Control' && this.placementMode) {
      this.controlModeStop();
    }
  }
  controlListener = (key: KeyboardEvent) => {
    if (key.key === 'Control' && this.placementMode) {
      if (this.circleShown) {
        const circleElem = document.getElementById('placementCircle');
        if (circleElem) {
          circleElem.style.display = 'none';
        }
        this.circleShown = false;
      }
      this.controlModeStart();
    }
  }

  ngAfterViewInit(): void {
    const mapImage = document.getElementById('world-map');
    if (mapImage) {
      mapImage.ondragstart = () => {
        return false;
      };

      const mapImg = new Image();
      mapImg.src = '../../../assets/images/maps/world-map.jpg';
      mapImg.onload = () => {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        this.mapDefaultWidth = (vw - 300);
        this.mapDefaultHeight = mapImage.clientWidth / mapImg.width * mapImg.height;
        this.mapImgWidth = mapImg.width;
        this.mapImgHeight = mapImg.height;
        mapImage.style.height = this.mapDefaultHeight.toString() + 'px';
      };
    }

    const mapElement = document.getElementById('map-wrap');
    if (!mapElement) {
      return;
    }

    window.onresize = (resEv: UIEvent) => {
      if (mapImage && mapElement.clientWidth === mapElement.scrollWidth) {
        mapImage.style.height = (mapElement.clientWidth * 0.5625).toString() + 'px';
        mapImage.style.width = '100%';
      }
    };

    mapElement.addEventListener('wheel', (evWheel) => {
      evWheel.preventDefault();
      if (this.circleShown) {
        return;
      }

      const vw = Math.max(window.innerWidth, 0);
      const vh = Math.max(window.innerHeight - 56, 0);
      // const ratio = 0.5625;
      // const ratio = vh / vw;
      let ratio = 0.5625;
      if (mapImage) {
        ratio = mapImage.clientHeight / mapImage.clientWidth;
      }


      // @ts-ignore
      const wd = evWheel.wheelDelta * -1;

      // @ts-ignore
      const leftOffset = (evWheel.clientX + mapElement.scrollLeft) / mapElement.scrollWidth * wd;
      // @ts-ignore
      const topOffset = (evWheel.clientY + mapElement.scrollTop - 56) / mapElement.scrollHeight * (wd * ratio);
      const scrollTmp = {
        left: leftOffset,
        top: topOffset
      };

      if (mapImage) {
        // @ts-ignore
        if (wd < 0) {
          if (mapImage.clientWidth >= 5000) {
            return;
          }
          // @ts-ignore
          mapImage.style.width = (mapImage.clientWidth - wd).toString() + 'px';
          // @ts-ignore
          mapImage.style.height = (mapImage.clientHeight - (wd * ratio)).toString() + 'px';
          mapElement.scrollTop -= scrollTmp.top;
          mapElement.scrollLeft -= scrollTmp.left;
        } else {
          if (mapImage.clientWidth < vw - 250) {
            mapImage.style.width = (vw - 300).toString() + 'px';
            mapImage.style.height = ((vw - 300) * ratio).toString() + 'px';
            return;
          }
          // @ts-ignore
          mapImage.style.width = (mapImage.clientWidth - wd).toString() + 'px';
          // @ts-ignore
          mapImage.style.height = (mapImage.clientHeight - (wd * ratio)).toString() + 'px';
          mapElement.scrollTop -= scrollTmp.top;
          mapElement.scrollLeft -= scrollTmp.left;
        }
      }
    });

    mapElement.addEventListener('mousedown', (evDown => {
      if (this.circleShown && evDown.button === 2) {
        const circleElem = document.getElementById('placementCircle');
        if (circleElem) {
          circleElem.style.display = 'none';
        }
        this.circleShown = false;
        evDown.preventDefault();
        evDown.stopPropagation();
        return;
      }
      if (this.placementMode && !this.controlMode) {
        const circleElem = document.getElementById('placementCircle');
        if (circleElem) {
          const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
          circleElem.style.top = (Math.min(Math.max(evDown.clientY - 70, 75), vh - 200)).toString() + 'px';
          circleElem.style.left = (Math.min(Math.max(evDown.clientX - 70, 30), this.mapDefaultWidth - 170)).toString() + 'px';
          circleElem.style.display = 'block';
          circleElem.style.cursor = 'url(\'assets/cursors/normal.cur\'), auto';
          this.circleShown = true;
          if (mapImage) {
            this.currentMarkerPosition.top = Math.min(Math.max(evDown.clientY + mapElement.scrollTop - 56, 1), mapImage.clientHeight - 1) / mapImage.clientHeight;
            this.currentMarkerPosition.left = Math.min(Math.max(evDown.clientX + mapElement.scrollLeft, 1), mapImage.clientWidth - 1) / mapImage.clientWidth;
          }
        }
        return;
      }

      if (this.circleShown) {
        return;
      }
      const pos = {
        left: mapElement.scrollLeft,
        top: mapElement.scrollTop,
        x: evDown.clientX,
        y: evDown.clientY,
        dx: 0,
        dy: 0
      };

      mapElement.style.cursor = 'url(\'assets/cursors/dragActive.cur\'), grabbing';

      const mouseMoveHandler = (evMove: MouseEvent) => {
        pos.dx = evMove.clientX - pos.x;
        pos.dy = evMove.clientY - pos.y;

        // Scroll the element
        mapElement.scrollTop = pos.top - pos.dy;
        mapElement.scrollLeft = pos.left - pos.dx;
      };

      const mouseUpHandler = (evUp: MouseEvent) => {
        mapElement.style.cursor = 'url(\'assets/cursors/normal.cur\'), auto';
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);

        if (pos.dy === 0 && pos.dy === 0) {
          if (this.isMapSelected && !this.placementMode && !this.controlMode && this.selectedMarker) {
            this.selectedMarker = undefined;
          }

          // @ts-ignore
          if (evDown.target && evDown.target.id !== 'world-map') {
            // @ts-ignore
            evDown.target.dispatchEvent(new MouseEvent('click', evDown.nativeEvent));
          }
        } else {
          evDown.stopPropagation();
          evDown.preventDefault();
        }
      };

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    }));

    document.addEventListener('keyup', (keyEv: KeyboardEvent) => {
      // console.log(keyEv.key);
      if (this.isMapSelected && !this.placementMode && !this.isEditDescription && keyEv.key === 'p') {
        const user = this.auth.user$.getValue();
        if (user && user.permissions > 0) {
          this.placementModeStart();
        }
      }
      if (this.isMapSelected && !this.placementMode && !this.isEditDescription && keyEv.key === 'Backspace') {
        this.returnToWorldMap();
      }
      if (this.isMapSelected && !this.placementMode && this.selectedMarker && !this.isEditDescription && keyEv.key === 'Delete') {
        const user = this.auth.user$.getValue();
        if (user && user.permissions > 0) {
          this.markerDelete(this.selectedMarker);
        }
      }
    });
  }

  ngOnInit(): void {
  }

  goToMap(data: MapData): void {
    this.selectedMap = data;
    this.isMapSelected = true;
    if (data.subMaps.length > 1) {
      this.selectedSubMap = data.subMaps[0];
    }
    const gather: Record<string, { isShown: boolean, name: string }> = {};
    data.materials.forEach((mat) => {
      if (mat.isGathering) {
        gather[mat.bigIconUrl] = {
          isShown: true,
          name: mat.name
        };
      }
    });
    const fish: Record<string, { isShown: boolean, name: string }> = {};
    data.fish.forEach((mat) => {
      fish[mat.bigIconUrl] = {
        isShown: true,
        name: mat.name
      };
    });
    this.markerFilter = {
      dungeon: true,
      hunt: true,
      collectible: true,
      poi: true,
      treasure: true,
      monster: true,
      gather,
      fish
    };
    // console.log(this.markerFilter);
    const mapElem = document.getElementById('world-map');
    if (mapElem) {
      mapElem.style.backgroundImage = 'url(\'assets/images/maps/' + data.id + '.jpg\')';
    }
    this.resetZoom();
    this.db.getMarker(data).subscribe((result) => {
      this.activeMarker = result;
    }, error => console.log(error));
  }

  goToSubMap(id: string): void {
    const mapElem = document.getElementById('world-map');
    if (mapElem) {
      mapElem.style.backgroundImage = 'url(\'assets/images/maps/' + id + '.jpg\')';
    }
    this.resetZoom();
    this.db.getMarkerById(id).subscribe((result) => {
      this.activeMarker = result;
    }, error => console.log(error));
  }

  returnToWorldMap(): void {
    this.selectedMap = undefined;
    this.isMapSelected = false;
    const mapElem = document.getElementById('world-map');
    if (mapElem) {
      mapElem.style.backgroundImage = 'url(\'assets/images/maps/world-map.jpg\')';
    }
    this.resetZoom();
    this.activeMarker = [];
    this.selectedMarker = undefined;
  }

  resetZoom(): void {
    const mapImage = document.getElementById('world-map');
    if (mapImage) {
      mapImage.style.width = this.mapDefaultWidth + 'px';
      mapImage.style.height = this.mapDefaultHeight + 'px';
    }
  }

  placementModeStart(): void {
    const mapWrap = document.getElementById('map-wrap');
    if (mapWrap) {
      mapWrap.style.cursor = 'url(\'assets/cursors/place.cur\'), pointer';
    }

    document.addEventListener('keydown', this.controlListener);
    document.addEventListener('keyup', this.controlListener);
    document.addEventListener('keyup', this.escapeListener);

    this.selectedMarker = undefined;

    this.placementMode = true;
  }

  placementModeStop(): void {
    document.body.style.cursor = 'url(\'assets/cursors/normal.cur\'), auto';
    const mapWrap = document.getElementById('map-wrap');
    if (mapWrap) {
      mapWrap.style.cursor = 'url(\'assets/cursors/normal.cur\'), auto';
    }
    const circleElem = document.getElementById('placementCircle');
    if (circleElem) {
      circleElem.style.display = 'none';
    }
    document.removeEventListener('keydown', this.controlListener);
    document.removeEventListener('keyup', this.controlListener);
    document.removeEventListener('keyup', this.escapeListener);

    this.placementMode = false;
  }

  controlModeStart(): void {
    const mapWrap = document.getElementById('map-wrap');
    if (mapWrap) {
      mapWrap.style.cursor = 'url(\'assets/cursors/drag.cur\'), grab';
    }

    this.controlMode = true;
  }

  controlModeStop(): void {
    const mapWrap = document.getElementById('map-wrap');
    if (mapWrap) {
      mapWrap.style.cursor = 'url(\'assets/cursors/place.cur\'), pointer';
    }

    this.controlMode = false;
  }

  createMarker(type: string): void {
    const circleElem = document.getElementById('placementCircle');
    if (circleElem) {
      circleElem.style.display = 'none';
    }
    if (!this.selectedMap) {
      return;
    }
    const marker = {
      uid: '',
      map: this.selectedMap.id,
      position: {
        top: this.currentMarkerPosition.top,
        left: this.currentMarkerPosition.left
      },
      timestamp: new Date(),
      type
    };

    this.db.createMarker(marker).subscribe((result) => {
      this.activeMarker.push(result);

      this.selectedMarker = result;

      const mapWrap = document.getElementById('map-wrap');
      if (mapWrap) {
        mapWrap.style.cursor = 'url(\'assets/cursors/normal.cur\'), auto';
      }

      this.circleShown = false;
      this.controlMode = false;
      this.placementMode = false;
    }, error => console.log(error));
  }

  markerSelected(marker: MapMarker): void {
    this.selectedMarker = marker;
  }

  markerDataSaved(marker: MapMarker): void {
    this.db.updateMarker(marker).subscribe(() => {
      console.log('marker updated');
    }, error => console.log(error));
  }

  placementTriggered($event: boolean): void {
    if ($event) {
      this.placementModeStart();
    } else {
      this.placementModeStop();
    }
  }

  markerDelete($event: MapMarker): void {
    this.db.deleteMarker($event).subscribe(() => {
      this.activeMarker = this.activeMarker.filter(x => x.uid !== $event.uid);
      this.selectedMarker = undefined;
      console.log('marker deleted');
    }, error => console.log(error));
  }

  editDescription($event: boolean): void {
    this.isEditDescription = $event;
  }

  filterChanged(): void {
    if (!this.selectedMap) {
      return;
    }
    this.db.getMarker(this.selectedMap, this.markerFilter).subscribe((result) => {
      this.activeMarker = result;
      if (this.selectedMarker) {
        this.activeMarker = this.activeMarker.filter(x => x.uid !== this.selectedMarker?.uid);
        this.activeMarker.push(this.selectedMarker);
      }
    }, error => console.log(error));
  }

  getMarkerClasses(marker: MapMarker): any {
    const cls: any = {
      'marker-icon': true,
      'gather-icon': marker.type === 'gather' && !marker.material,
      'fish-icon': marker.type === 'fish' && !marker.fish,
      'monster-icon': marker.type === 'monster',
      'collectible-icon': marker.type === 'collectible',
      'treasure-icon': marker.type === 'treasure',
      'poi-icon': marker.type === 'poi',
      'hunt-icon': marker.type === 'hunt',
      'hunt-easy-icon': marker.hunt ? marker.hunt.difficulty === 0 : false,
      'hunt-medium-icon': marker.hunt ? marker.hunt.difficulty === 1 : false,
      'hunt-hard-icon': marker.hunt ? marker.hunt.difficulty === 2 : false,
      'dungeon-icon': marker.type === 'dungeon',
      'selected-marker-icon': this.selectedMarker ? marker.uid === this.selectedMarker.uid : false };
    if (marker.material) {
      cls[marker.material + '-icon'] = true;
    }
    if (marker.fish) {
      cls[marker.fish + '-icon'] = true;
    }
    return cls;
  }

  selectSubMap(submap: number): void {
    if (this.selectedMap && this.selectedMap.subMaps.length >= submap + 1) {
      this.selectedSubMap = this.selectedMap.subMaps[submap];
      if (submap === 0) {
        this.goToSubMap(this.selectedMap.id);
      } else {
        this.goToSubMap(this.selectedMap.id + '_' + submap.toString());
      }
    }
  }
}
