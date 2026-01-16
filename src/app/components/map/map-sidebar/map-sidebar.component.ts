import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MapMarker, ResetTime } from '../../../models/map';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { materialData, fishData } from '../../../models/mapData';

@Component({
  selector: 'app-map-sidebar',
  templateUrl: './map-sidebar.component.html',
  styleUrls: ['./map-sidebar.component.css']
})
export class MapSidebarComponent implements OnInit {
  @Input() placementMode: boolean;
  @Input() placementPossible: boolean;
  @Input() selectedMarker: MapMarker | undefined;
  @Input() filter: Record<string, boolean | any>;

  @Output() placementModeTriggered = new EventEmitter<boolean>();
  @Output() markerEdit = new EventEmitter<MapMarker>();
  @Output() markerDelete = new EventEmitter<MapMarker>();
  @Output() description = new EventEmitter<boolean>();
  @Output() filterChanged = new EventEmitter<void>();

  isEditDescription = false;
  displayAllMarkers = true;
  displayGoldMarkers = false;
  showFilter = true;
  editingGatherType = false;

  filterChangedSubject = new Subject<void>();

  constructor(public auth: AuthService) {
    this.placementMode = false;
    this.placementPossible = false;
    this.filter = {};

    this.filterChangedSubject
      .pipe(debounceTime(400))
      .subscribe(() => {
        this.filterChanged.emit();
      });
  }

  ngOnInit(): void {
    console.log(this.filter);
  }

  goIntoPlacementMode(): void {
    this.placementModeTriggered.emit(true);
  }


  goOutofPlacementMode(): void {
    this.placementModeTriggered.emit(false);
  }

  editDescription(): void {
    this.isEditDescription = true;
    this.description.emit(true);
  }

  saveDescription(): void {
    this.isEditDescription = false;
    this.description.emit(false);
    this.markerEdit.emit(this.selectedMarker);
  }

  deleteMarker(): void {
    this.markerDelete.emit(this.selectedMarker);
  }

  getFilterName(key: string): string {
    switch (key) {
      case 'hc_001':
        return 'Xihua Stone';
      case 'hc_002':
        return 'Gold Thread';
      case 'hc_003':
        return 'Rattan Crystal';
      case 'hc_004':
        return 'Tumbleweed';
      case 'hc_005':
        return 'Night Scent';
      case 'hc_006':
        return 'Water Jade';
      case 'hc_007':
        return 'Fire Red Crystals';
      case 'hc_008':
        return 'Bone Phosphate';
      case 'hc_009':
        return 'Dust Hearts';
      case 'hc_010':
        return 'Earth Sprite Hair';
      case 'hc_011':
        return 'Golden Scale';
      case 'hc_012':
        return 'Fire Pearl';
      case 'hc_013':
        return 'Fire Soul';
      case 'hc_014':
        return 'Hexagonal Snowflake';
      case 'hc_015':
        return 'Ice Soul';
      case 'hc_016':
        return 'Thousandfold Steel';
      case 'hc_017':
        return 'Thousand Leaf Pearls';
      case 'hc_018':
        return 'Yellowstone';
      case 'hc_019':
        return 'Cijin Stone';
      case 'hc_021':
        return 'Algal Crystal';
      case 'hc_022':
        return 'Red Sand Crystal';
      case 'hc_023':
        return 'Gold Bamboo Stones';
      case 'hc_025':
        return 'Earth Iris';
      case 'fish_017_001':
        return 'Prawn';
      case 'fish_017_002':
        return 'Prawn';
      case 'fish_018_001':
        return 'Jade Carp';
      case 'fish_019_001':
        return 'Mandarin Fish';
      case 'fish_020_001':
        return 'Twig Catfish';
      case 'fish_021_001':
        return 'Jiujiang Mullet';
      case 'fish_022_001':
        return 'Speckled Perch';
      case 'fish_023_001':
        return 'Tiger Crab';
      case 'fish_024_001':
        return 'Red Bream';
      case 'fish_025_001':
        return 'Pufferfish';
      case 'fish_026_001':
        return 'Sea Bass';
      default:
        return '';
    }
  }

  checkGoldMarkers(): void {
    if (!this.displayGoldMarkers) {
      return;
    }
    this.displayAllMarkers = false;
    this.filterChangedSubject.next();
    for (const filterKey in this.filter) {
      if (this.filter.hasOwnProperty(filterKey)) {
        if (filterKey === 'gather') {
          for (const gatherKey in this.filter[filterKey]) {
            if (this.filter[filterKey].hasOwnProperty(gatherKey)) {
              for (const materialDataKey in materialData) {
                if (materialData.hasOwnProperty(materialDataKey) && gatherKey === materialData[materialDataKey].bigIconUrl) {
                  this.filter[filterKey][gatherKey].isShown = !!materialData[materialDataKey].gold;
                }
              }
            }
          }
        } else if (filterKey === 'fish') {
          for (const gatherKey in this.filter[filterKey]) {
            if (this.filter[filterKey].hasOwnProperty(gatherKey)) {
              for (const fishDataKey in fishData) {
                if (fishData.hasOwnProperty(fishDataKey) && gatherKey === fishData[fishDataKey].bigIconUrl) {
                  this.filter[filterKey][gatherKey].isShown = !!fishData[fishDataKey].gold;
                }
              }
            }
          }
        } else {
          this.filter[filterKey] = false;
        }
      }
    }
  }

  checkAllMarkers(): void {
    this.filterChangedSubject.next();
    this.displayGoldMarkers = false;
    if (!this.displayAllMarkers) {
      for (const filterKey in this.filter) {
        if (this.filter.hasOwnProperty(filterKey)) {
          if (filterKey === 'gather' || filterKey === 'fish') {
            for (const gatherKey in this.filter[filterKey]) {
              if (this.filter[filterKey].hasOwnProperty(gatherKey)) {
                this.filter[filterKey][gatherKey].isShown = false;
              }
            }
          } else {
            this.filter[filterKey] = false;
          }
        }
      }
    } else {
      for (const filterKey in this.filter) {
        if (this.filter.hasOwnProperty(filterKey)) {
          if (filterKey === 'gather' || filterKey === 'fish') {
            for (const gatherKey in this.filter[filterKey]) {
              if (this.filter[filterKey].hasOwnProperty(gatherKey)) {
                this.filter[filterKey][gatherKey].isShown = true;
              }
            }
          } else {
            this.filter[filterKey] = true;
          }
        }
      }
    }
  }

  filterClicked(): void {
    this.filterChangedSubject.next();
    this.displayGoldMarkers = false;
    this.displayAllMarkers = false;
  }

  editGatherType(key: unknown): void {
    if (this.selectedMarker && typeof key === 'string') {
      this.selectedMarker.material = key;
    }
    this.editingGatherType = false;
    this.markerEdit.emit(this.selectedMarker);
  }

  editFishType(key: unknown): void {
    if (this.selectedMarker && typeof key === 'string') {
      this.selectedMarker.fish = key;
    }
    this.editingGatherType = false;
    this.markerEdit.emit(this.selectedMarker);
  }

  getResetDay(reset: ResetTime): string {
    switch (reset) {
      case ResetTime.daily:
        return 'Daily';
      case ResetTime.sunday:
        return 'Sunday';
      case ResetTime.thursday:
        return 'Thursday';
      case ResetTime.free:
        return ' Free';
      case ResetTime.thursdayAndSunday:
        return 'Thu + Sun';
    }
  }

  getHuntSize(difficulty: number): string {
    switch (difficulty) {
      case 0:
        return 'SOLO';
      case 1:
        return 'PARTY';
      case 2:
        return 'RAID';
      default:
        return '';
    }
  }
}
