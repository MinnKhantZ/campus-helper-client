import { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import CampusMarker from "../components/CampusMarker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, spacing } from "../theme";

const campusLocations = [
  { id: 1, name: "Main Library", coordinate: { latitude: 22.030890315496965, longitude: 96.10182477082867 }, icon: "local-library" },
  { id: 2, name: "Dean", coordinate: { latitude: 22.03097901933545, longitude: 96.10126019355586 }, icon: "account-circle" },
  { id: 3, name: "Main Building", coordinate: { latitude: 22.0299504851196, longitude: 96.10135127082421 }, icon: "apartment" },
  { id: 4, name: "Drawing Building", coordinate: { latitude: 22.030263768065762, longitude: 96.10245097652957 }, icon: "brush" },
  { id: 5, name: "Mechanical Dept", coordinate: { latitude: 22.03097881561455, longitude: 96.10264674904249 }, icon: "precision-manufacturing" },
  { id: 6, name: "Mechatronic Dept", coordinate: { latitude: 22.03125270607916, longitude: 96.10269185823829 }, icon: "memory" },
  { id: 7, name: "IT Department", coordinate: { latitude: 22.0314994161156, longitude: 96.10276177749769 }, icon: "computer" },
  { id: 8, name: "Civil Dept", coordinate: { latitude: 22.03233571814041, longitude: 96.10098221959079 }, icon: "engineering" },
  { id: 9, name: "Electronic Dept", coordinate: { latitude: 22.032167544042718, longitude: 96.10221799098197 }, icon: "cable" },
  { id: 10, name: "Architecture Dept", coordinate: { latitude: 22.032123192502727, longitude: 96.10246678774625 }, icon: "architecture" },
  { id: 11, name: "Electrical Dept", coordinate: { latitude: 22.03220893880358, longitude: 96.10201385004733 }, icon: "bolt" },
  { id: 12, name: "Canteen", coordinate: { latitude: 22.03181601776903, longitude: 96.10340679744114 }, icon: "restaurant" },
  { id: 13, name: "Indoor Stadium", coordinate: { latitude: 22.03366185742176, longitude: 96.10281455797926 }, icon: "sports-handball" },
  { id: 14, name: "Football Ground", coordinate: { latitude: 22.03449725516056, longitude: 96.10308277888068 }, icon: "sports-soccer" },
] as const;

const MapScreen = () => {
  type MapViewLike = MapView & { animateToRegion: (region: Region, duration?: number) => void };
  const mapRef = useRef<MapViewLike | null>(null);
  const [selected, setSelected] = useState<(typeof campusLocations)[number] | null>(null);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const focusOnMarker = (index: number) => {
    const location = campusLocations[index];
    if (!location) return;
    setSelected(location);
    mapRef.current?.animateToRegion(
      { ...location.coordinate, latitudeDelta: 0.001, longitudeDelta: 0.001 },
      800
    );
  };

  const PanelBackground = ({ children, style }: { children: React.ReactNode; style?: any }) => {
    if (Platform.OS === "ios") {
      return (
        <BlurView intensity={theme.tabBarBlur} tint="light" style={[styles.panel, style]}>
          {children}
        </BlurView>
      );
    }
    return (
      <View style={[styles.panel, { backgroundColor: theme.surfaceSolid }, style]}>
        {children}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 22.03042,
          longitude: 96.10138,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        }}
        customMapStyle={[
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        ]}
      >
        {campusLocations.map((location) => (
          <CampusMarker key={location.id} location={location} />
        ))}
      </MapView>

      {/* Location pill bar */}
      <PanelBackground style={styles.chipBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {campusLocations.map((loc, index) => {
            const isActive = selected?.id === loc.id;
            return (
              <TouchableOpacity
                key={loc.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? theme.primary : theme.chip,
                    borderColor: isActive ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => focusOnMarker(index)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={loc.icon as any}
                  size={16}
                  color={isActive ? "#fff" : theme.primary}
                />
                <Text style={[styles.chipText, { color: isActive ? "#fff" : theme.primary }]} numberOfLines={1}>
                  {loc.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </PanelBackground>

      {/* Selected location info card */}
      {selected && (
        <MotiView
          key={selected.id}
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 30 }}
          transition={{ type: "spring", damping: 18, stiffness: 200 }}
          style={[styles.infoCardWrap, { bottom: insets.bottom + 110 }]}
        >
          {Platform.OS === "ios" ? (
            <BlurView intensity={theme.cardBlur} tint="light" style={styles.infoCard}>
              <InfoCardContent selected={selected} theme={theme} />
            </BlurView>
          ) : (
            <View style={[styles.infoCard, { backgroundColor: theme.surfaceSolid }]}>
              <InfoCardContent selected={selected} theme={theme} />
            </View>
          )}
        </MotiView>
      )}
    </View>
  );
};

const InfoCardContent = ({
  selected,
  theme,
}: {
  selected: (typeof campusLocations)[number];
  theme: ReturnType<typeof useTheme>;
}) => (
  <View style={styles.infoInner}>
    <View style={[styles.infoIcon, { backgroundColor: theme.chip }]}>
      <MaterialIcons name={selected.icon as any} size={24} color={theme.primary} />
    </View>
    <View style={styles.infoText}>
      <Text style={[styles.infoTitle, { color: theme.text }]}>{selected.name}</Text>
      <Text style={[styles.infoCoords, { color: theme.textMuted }]}>
        {selected.coordinate.latitude.toFixed(5)}, {selected.coordinate.longitude.toFixed(5)}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  chipBar: {
    position: "absolute",
    top: 60,
    left: spacing.md,
    right: spacing.md,
    borderColor: "rgba(148,163,184,0.3)",
  },
  chipScroll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    maxWidth: 110,
  },
  infoCardWrap: {
    position: "absolute",
    bottom: 110,
    left: spacing.md,
    right: spacing.md,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.3)",
    overflow: "hidden",
  },
  infoInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { flex: 1 },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  infoCoords: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default MapScreen;

