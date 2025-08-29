import { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView from "react-native-maps";
import { Surface } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import CampusMarker from "../components/CampusMarker";
import Colors from "../constants/Colors";

const campusLocations = [
  { id: 1, name: 'Main Library', coordinate: { latitude: 22.030890315496965, longitude: 96.10182477082867 }, icon: 'local-library' },
  { id: 2, name: 'Dean', coordinate: { latitude: 22.03097901933545, longitude: 96.10126019355586 }, icon: 'account-circle' },
  { id: 3, name: 'Main Building', coordinate: { latitude: 22.0299504851196, longitude: 96.10135127082421 }, icon: 'apartment' },
  { id: 4, name: 'Drawing Building', coordinate: { latitude: 22.030263768065762, longitude: 96.10245097652957 }, icon: 'brush' },
  { id: 5, name: 'Mechanical Department', coordinate: { latitude: 22.03097881561455, longitude: 96.10264674904249 }, icon: 'precision-manufacturing' },
  { id: 6, name: 'Mechatronic Department', coordinate: { latitude: 22.03125270607916, longitude: 96.10269185823829 }, icon: 'memory' },
  { id: 7, name: 'Information Technology Department', coordinate: { latitude: 22.0314994161156, longitude: 96.10276177749769 }, icon: 'computer' },
  { id: 8, name: 'Civil Department', coordinate: { latitude: 22.03233571814041, longitude: 96.10098221959079 }, icon: 'engineering' },
  { id: 9, name: 'Electronic Department', coordinate: { latitude: 22.032167544042718, longitude: 96.10221799098197 }, icon: 'cable' },
  { id: 10, name: 'Architecture Department', coordinate: { latitude: 22.032123192502727, longitude: 96.10246678774625 }, icon: 'architecture' },
  { id: 11, name: 'Electrical Power Department', coordinate: { latitude: 22.03220893880358, longitude: 96.10201385004733 }, icon: 'bolt' },
  { id: 12, name: 'Canteen', coordinate: { latitude: 22.03181601776903, longitude: 96.10340679744114 }, icon: 'restaurant' },
  { id: 13, name: 'Indoor Stadium', coordinate: { latitude: 22.03366185742176, longitude: 96.10281455797926 }, icon: 'sports-handball' },
  { id: 14, name: 'Football Ground', coordinate: { latitude: 22.03449725516056, longitude: 96.10308277888068 }, icon: 'sports-soccer' }
] as const;

const MapScreen = () => {
  const mapRef = useRef<MapView | null>(null);
  const [selected, setSelected] = useState<(typeof campusLocations)[number] | null>(null);
    
  const focusOnMarker = (index: number) => {
  const location = campusLocations[index];
  if (!location) return;
  setSelected(location);
    mapRef.current?.animateToRegion(
      {
        ...location.coordinate,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      },
      1000
    );
  };

  return (
    <View style={styles.container}>
        <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
                latitude: 22.03042,
                longitude: 96.10138,
                latitudeDelta: 0.004,
                longitudeDelta: 0.004,
            }}
            customMapStyle={[
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
            ]}
        >
            {campusLocations.map((location) => (
                <CampusMarker key={location.id} location={location} />
            ))}
        </MapView>

        <Surface style={styles.navBar} elevation={4}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {campusLocations.map((loc, index) => (
                <TouchableOpacity
                    key={loc.id}
                    style={styles.navButton}
                    onPress={() => focusOnMarker(index)}
                >
                    <MaterialIcons name={loc.icon} size={28} color={Colors.primary} />
                </TouchableOpacity>
            ))}
            </ScrollView>
        </Surface>

        {selected && (
            <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{selected.name}</Text>
            <Text style={styles.infoText}>
                Lat: {selected.coordinate.latitude.toFixed(5)}
            </Text>
            <Text style={styles.infoText}>
                Lon: {selected.coordinate.longitude.toFixed(5)}
            </Text>
            </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  navBar: {
    position: "absolute",
    bottom: 30,
    left: 10,
    right: 10,
    padding: 6,
    borderRadius: 12,
    flexDirection: "row",
    backgroundColor: `${Colors.surface}ee`,
  },
  navButton: {
    marginHorizontal: 6,
    backgroundColor: Colors.background,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoCard: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: Colors.gray,
  },
});

export default MapScreen;
