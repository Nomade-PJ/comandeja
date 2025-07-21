// Definições globais para tipos que causam problemas de profundidade excessiva

// Definição para evitar errors de "Type instantiation is excessively deep and possibly infinite"
declare namespace TypeFix {
  export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
  };
}

// Google Maps API
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      setOptions(options: MapOptions): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      getBounds(): LatLngBounds;
      getCenter(): LatLng;
      getZoom(): number;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setMap(map: Map | null): void;
      setTitle(title: string): void;
      setIcon(icon: string | Icon | Symbol): void;
      getPosition(): LatLng;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      toString(): string;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      contains(latLng: LatLng | LatLngLiteral): boolean;
      getCenter(): LatLng;
    }

    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
      width: number;
      height: number;
    }

    class DirectionsService {
      constructor();
      route(request: DirectionsRequest, callback: (result: DirectionsResult, status: DirectionsStatus) => void): void;
    }

    class DirectionsRenderer {
      constructor(opts?: DirectionsRendererOptions);
      setMap(map: Map | null): void;
      setDirections(directions: DirectionsResult): void;
      setOptions(options: DirectionsRendererOptions): void;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      styles?: Array<MapTypeStyle>;
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers: Array<{ [key: string]: any }>;
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
    }

    interface Icon {
      url: string;
      size?: Size;
      scaledSize?: Size;
      origin?: Point;
      anchor?: Point;
    }

    interface Point {
      x: number;
      y: number;
    }

    interface Symbol {
      path: string | SymbolPath;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    enum SymbolPath {
      BACKWARD_CLOSED_ARROW,
      BACKWARD_OPEN_ARROW,
      CIRCLE,
      FORWARD_CLOSED_ARROW,
      FORWARD_OPEN_ARROW
    }

    interface DirectionsRequest {
      origin: string | LatLng | LatLngLiteral | Place;
      destination: string | LatLng | LatLngLiteral | Place;
      travelMode: TravelMode;
      waypoints?: Array<DirectionsWaypoint>;
      optimizeWaypoints?: boolean;
    }

    interface DirectionsWaypoint {
      location: string | LatLng | LatLngLiteral | Place;
      stopover?: boolean;
    }

    interface Place {
      location: LatLng | LatLngLiteral;
      placeId: string;
      query: string;
    }

    interface DirectionsResult {
      routes: Array<DirectionsRoute>;
    }

    interface DirectionsRoute {
      legs: Array<DirectionsLeg>;
      overview_path: Array<LatLng>;
      overview_polyline: string;
      warnings: Array<string>;
      waypoint_order: Array<number>;
    }

    interface DirectionsLeg {
      distance: Distance;
      duration: Duration;
      start_address: string;
      start_location: LatLng;
      end_address: string;
      end_location: LatLng;
      steps: Array<DirectionsStep>;
    }

    interface DirectionsStep {
      distance: Distance;
      duration: Duration;
      instructions: string;
      path: Array<LatLng>;
      travel_mode: TravelMode;
    }

    interface Distance {
      text: string;
      value: number;
    }

    interface Duration {
      text: string;
      value: number;
    }

    interface DirectionsRendererOptions {
      directions?: DirectionsResult;
      map?: Map;
      panel?: Element;
      polylineOptions?: PolylineOptions;
      suppressMarkers?: boolean;
      suppressPolylines?: boolean;
      suppressInfoWindows?: boolean;
    }

    interface PolylineOptions {
      path?: Array<LatLng | LatLngLiteral>;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    enum TravelMode {
      BICYCLING,
      DRIVING,
      TRANSIT,
      WALKING
    }

    enum DirectionsStatus {
      INVALID_REQUEST,
      MAX_WAYPOINTS_EXCEEDED,
      NOT_FOUND,
      OK,
      OVER_QUERY_LIMIT,
      REQUEST_DENIED,
      UNKNOWN_ERROR,
      ZERO_RESULTS
    }
  }
}

// Extend Window interface
interface Window {
  google?: typeof google;
} 