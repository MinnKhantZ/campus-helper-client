declare module 'react-native-maps' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';
  export interface Region { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number; }
  export interface LatLng { latitude: number; longitude: number; }
  export class Marker extends React.Component<{ coordinate: LatLng } & ViewProps> {}
  export { Marker };
  class MapView extends React.Component<ViewProps & {
    initialRegion?: Region;
    customMapStyle?: unknown;
  }> {
    animateToRegion(region: Region, duration?: number): void;
  }
  export default MapView;
}

declare module 'react-native-maps/*' {
  export * from 'react-native-maps';
  export { default } from 'react-native-maps';
}
