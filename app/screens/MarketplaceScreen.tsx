import { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Linking, Alert, ScrollView } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { MotiView } from "moti";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { ActivityIndicator } from "react-native-paper";
import { useListItemsQuery, useDeleteItemMutation } from "../api/Marketplace";
import type { MarketplaceItem } from "../types";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation";
import GlassCard from "../components/ui/GlassCard";
import GlassInput from "../components/ui/GlassInput";
import AnimatedListItem from "../components/ui/AnimatedListItem";
import FloatingActionButton from "../components/ui/FloatingActionButton";
import ProfileButton from "../components/ui/ProfileButton";
import { useTheme, spacing, radius, shadow } from "../theme";

const ItemCard = ({
  item, onPress, onEdit, onDelete, onCall, onLink, canEdit,
}: {
  item: MarketplaceItem;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCall?: () => void;
  onLink?: () => void;
  canEdit: boolean;
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isAvailable = item.status === "available";

  return (
    <Animated.View style={anim}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 14, stiffness: 280 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 280 }); }}
        activeOpacity={1}
      >
        <GlassCard style={styles.card}>
          <View style={styles.cardInner}>
            {/* Status bar */}
            <View style={[styles.statusBar, { backgroundColor: isAvailable ? theme.success : theme.error }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.itemPrice, { color: theme.primary }]}>${item.price.toFixed(2)}</Text>
              </View>
              {item.description ? (
                <Text style={[styles.itemDesc, { color: theme.textMuted }]} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <View style={styles.chipRow}>
                {item.category ? (
                  <View style={[styles.chip, { backgroundColor: theme.chip }]}>
                    <Text style={[styles.chipText, { color: theme.chipText }]}>{item.category}</Text>
                  </View>
                ) : null}
                <View style={[styles.chip, { backgroundColor: isAvailable ? theme.success + "33" : theme.error + "33" }]}>
                  <Text style={[styles.chipText, { color: isAvailable ? theme.success : theme.error }]}>
                    {isAvailable ? "Available" : "Sold"}
                  </Text>
                </View>
              </View>
              {/* Actions */}
              {(onCall || onLink || canEdit) ? (
                <View style={styles.cardActions}>
                  {onCall && (
                    <TouchableOpacity onPress={onCall} style={[styles.iconBtn, { backgroundColor: theme.chip }]} activeOpacity={0.8}>
                      <Icon name="phone" size={16} color={theme.primary} />
                    </TouchableOpacity>
                  )}
                  {onLink && (
                    <TouchableOpacity onPress={onLink} style={[styles.iconBtn, { backgroundColor: theme.chip }]} activeOpacity={0.8}>
                      <Icon name="web" size={16} color={theme.primary} />
                    </TouchableOpacity>
                  )}
                  {canEdit && (
                    <>
                      <TouchableOpacity onPress={onEdit} style={[styles.iconBtn, { backgroundColor: theme.chip }]} activeOpacity={0.8}>
                        <Icon name="pencil" size={16} color={theme.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onDelete} style={[styles.iconBtn, { backgroundColor: theme.error + "22" }]} activeOpacity={0.8}>
                        <Icon name="delete" size={16} color={theme.error} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ) : null}
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SORT_OPTIONS = [
  { key: "createdAt:desc", label: "Newest" },
  { key: "createdAt:asc", label: "Oldest" },
  { key: "price:asc", label: "Price ?" },
  { key: "price:desc", label: "Price ?" },
];

const MarketplaceScreen = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [status, setStatus] = useState<"available" | "sold" | undefined>("available");
  const [sort, setSort] = useState("createdAt:desc");
  const { data, isFetching, refetch } = useListItemsQuery({ q, category, status, sort });
  const [delItem] = useDeleteItemMutation();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();

  const categories = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((i) => { if (i.category) set.add(i.category); });
    return Array.from(set);
  }, [data]);

  const onDelete = (id: number) => {
    Alert.alert("Delete Item", "Delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try { await delItem(id).unwrap(); }
          catch { Alert.alert("Error", "Failed to delete item."); }
        },
      },
    ]);
  };

  const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.filterChip,
        { backgroundColor: active ? theme.primary : theme.chip, borderColor: active ? theme.primary : theme.border },
      ]}
    >
      <Text style={[styles.filterChipText, { color: active ? theme.textInverse : theme.textMuted }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 160 }}
          style={styles.headerArea}
        >
          <View style={styles.headerTitleRow}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Marketplace</Text>
            <ProfileButton />
          </View>
          <GlassInput
            placeholder="Search items..."
            value={q}
            onChangeText={setQ}
            style={styles.search}
          />
        </MotiView>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
          <FilterChip label="Available" active={status === "available"} onPress={() => setStatus(status === "available" ? undefined : "available")} />
          <FilterChip label="Sold" active={status === "sold"} onPress={() => setStatus(status === "sold" ? undefined : "sold")} />
          <View style={styles.dividerV} />
          <FilterChip label="All Categories" active={!category} onPress={() => setCategory(undefined)} />
          {categories.map((c) => (
            <FilterChip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
          <View style={styles.dividerV} />
          {SORT_OPTIONS.map((o) => (
            <FilterChip key={o.key} label={o.label} active={sort === o.key} onPress={() => setSort(o.key)} />
          ))}
        </ScrollView>

        <FlatList
          data={data ?? []}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item, index }) => {
            const canEdit = user?.role === "admin" || user?.id === item.user_id;
            return (
              <AnimatedListItem index={index}>
                <ItemCard
                  item={item}
                  onPress={() => nav.navigate("MarketDetail", { id: item.id })}
                  onEdit={() => nav.navigate("MarketForm", { id: item.id })}
                  onDelete={() => onDelete(item.id)}
                  onCall={item.contact_phone ? () => Linking.openURL("tel:" + item.contact_phone) : undefined}
                  onLink={item.contact_link ? () => Linking.openURL(item.contact_link!) : undefined}
                  canEdit={canEdit}
                />
              </AnimatedListItem>
            );
          }}
          refreshing={isFetching}
          onRefresh={refetch}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !isFetching ? (
              <View style={styles.empty}>
                <Icon name="cart-off" size={48} color={theme.textMuted} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No items found</Text>
              </View>
            ) : null
          }
        />

        <FloatingActionButton onPress={() => nav.navigate("MarketForm")} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  headerArea: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  headerTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  search: { marginBottom: 0 },
  filtersScroll: { flexShrink: 0 },
  filtersContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs, alignItems: "center" },
  dividerV: { width: 1, height: 20, backgroundColor: "rgba(128,128,128,0.3)", marginHorizontal: spacing.xs },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1 },
  filterChipText: { fontSize: 13, fontWeight: "600" },
  list: { padding: spacing.md, paddingBottom: 120 },
  card: { marginBottom: spacing.sm },
  cardInner: { flexDirection: "row" },
  statusBar: { width: 4, borderRadius: 2, marginRight: spacing.sm },
  cardBody: { flex: 1, paddingVertical: spacing.sm, paddingRight: spacing.sm },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  itemTitle: { fontSize: 15, fontWeight: "700", flex: 1, marginRight: spacing.sm },
  itemPrice: { fontSize: 16, fontWeight: "800" },
  itemDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  chipText: { fontSize: 11, fontWeight: "600" },
  cardActions: { flexDirection: "row", gap: spacing.xs },
  iconBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  empty: { paddingTop: 60, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 16, fontWeight: "500" },
});

export default MarketplaceScreen;
