import { View, Text, StyleSheet, Image, Linking, ScrollView, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useGetItemQuery, useDeleteItemMutation } from "../api/Marketplace";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { RootStackParamList } from "../Navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BASE_URL } from "../api/BaseUrl";
import GlassCard from "../components/ui/GlassCard";
import GlassButton from "../components/ui/GlassButton";
import ScreenHeader from "../components/ScreenHeader";
import { useTheme, spacing, radius } from "../theme";

const MarketDetailScreen = () => {
  const route = useRoute<Readonly<{ key: string; name: "MarketDetail"; params: { id: number } }>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { id } = route.params;
  const { data: item } = useGetItemQuery(id);
  const user = useSelector((s: RootState) => s.auth.user);
  const [delItem] = useDeleteItemMutation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  if (!item) return null;

  const canEdit = user?.role === "admin" || user?.id === item.user_id;
  const imageUri = item.image_url
    ? item.image_url.startsWith("http") ? item.image_url : (BASE_URL.replace(/\/api$/, "") + item.image_url)
    : null;
  const isAvailable = item.status === "available";

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader name="Item Detail" navigation={nav} />

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
          {/* Image */}
          {imageUri ? (
            <MotiView from={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", delay: 40 }}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            </MotiView>
          ) : null}

          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "spring", delay: 80 }}>
            <GlassCard style={styles.infoCard}>
              {/* Title + Price */}
              <View style={styles.titleRow}>
                <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.price, { color: theme.primary }]}>{item.price} MMK</Text>
              </View>

              {/* Chips */}
              <View style={styles.chipRow}>
                <View style={[styles.chip, { backgroundColor: isAvailable ? theme.success + "33" : theme.error + "33" }]}>
                  <Icon name={isAvailable ? "check-circle" : "close-circle"} size={13} color={isAvailable ? theme.success : theme.error} />
                  <Text style={[styles.chipText, { color: isAvailable ? theme.success : theme.error }]}>{item.status}</Text>
                </View>
                {item.category ? (
                  <View style={[styles.chip, { backgroundColor: theme.chip }]}>
                    <Text style={[styles.chipText, { color: theme.chipText }]}>{item.category}</Text>
                  </View>
                ) : null}
              </View>

              {/* Description */}
              {item.description ? (
                <Text style={[styles.desc, { color: theme.textMuted }]}>{item.description}</Text>
              ) : null}

              {/* Contact buttons */}
              {(item.contact_phone || item.contact_link) && (
                <View style={styles.contactRow}>
                  {item.contact_phone ? (
                    <GlassButton
                      title="Call Seller"
                      onPress={() => Linking.openURL("tel:" + item.contact_phone)}
                      variant="primary"
                      style={styles.contactBtn}
                    />
                  ) : null}
                  {item.contact_link ? (
                    <GlassButton
                      title="Open Link"
                      onPress={() => Linking.openURL(item.contact_link!)}
                      variant="ghost"
                      style={styles.contactBtn}
                    />
                  ) : null}
                </View>
              )}
            </GlassCard>
          </MotiView>

          {/* Owner actions */}
          {canEdit ? (
            <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "spring", delay: 140 }}>
              <View style={styles.ownerActions}>
                <GlassButton
                  title="Edit"
                  onPress={() => nav.navigate("MarketForm", { id: item.id })}
                  variant="ghost"
                  style={styles.ownerBtn}
                />
                <GlassButton
                  title="Delete"
                  variant="danger"
                  style={styles.ownerBtn}
                  onPress={() => {
                    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete", style: "destructive", onPress: async () => {
                          try { await delItem(item.id).unwrap(); nav.goBack(); }
                          catch { Alert.alert("Error", "Failed to delete item."); }
                        },
                      },
                    ]);
                  }}
                />
              </View>
            </MotiView>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  image: { width: "100%", height: 240, borderRadius: radius.lg, marginBottom: spacing.md },
  infoCard: { padding: spacing.lg, marginBottom: spacing.md },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm, gap: spacing.sm },
  itemTitle: { fontSize: 22, fontWeight: "800", flex: 1, letterSpacing: -0.3 },
  price: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  chipText: { fontSize: 12, fontWeight: "600" },
  desc: { fontSize: 15, lineHeight: 22, marginBottom: spacing.md },
  contactRow: { flexDirection: "row", gap: spacing.sm },
  contactBtn: { flex: 1 },
  ownerActions: { flexDirection: "row", gap: spacing.sm },
  ownerBtn: { flex: 1 },
});

export default MarketDetailScreen;
