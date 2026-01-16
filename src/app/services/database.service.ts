import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MapData, MapMarker } from '../models/map';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(private httpClient: HttpClient) { }

  getMarker(data: MapData, filter?: Record<string, any>): Observable<any> {
    return this.httpClient.post<any>(`/api/marker/${data.id}`, filter);
  }

  getMarkerById(id: string, filter?: Record<string, any>): Observable<any> {
    return this.httpClient.post<any>(`/api/marker/${id}`, filter);
  }

  createMarker(marker: MapMarker): Observable<MapMarker> {
    return this.httpClient.post<any>(`/api/marker/`, marker);
  }

  updateMarker(marker: MapMarker): Observable<any> {
    return this.httpClient.put<any>(`/api/marker/${marker.uid}`, marker);
  }

  deleteMarker(marker: MapMarker): Observable<any> {
    console.log(marker);
    return this.httpClient.delete(`/api/marker/${marker.uid}?type=${marker.type}`);
  }
}
