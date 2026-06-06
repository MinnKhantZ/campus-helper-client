import { View, Text, StyleSheet, ScrollView, Image, Alert, Switch } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCreateItemMutation, useGetItemQuery, useUpdateItemMutation } from "../api/Marketplace";
import { useEffect, useState } from "react";
import type { RootStackParamList } from "../Navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../api/uploadImage";
import { BASE_URL } from "../api/BaseUrl";
import type { RootState } from "../store";
import { useStore } from "react-redux";
import GlassCard from "../components/ui/GlassCard";
import GlassInput from "../components/ui/GlassInput";
import GlassButton from "../components/ui/GlassButton";
import ScreenHeader from "../components/ScreenHeader";
import { useTheme, spacing, radius } from "../theme";

const MarketFormScreen = () => {
  const route = useRoute<Readonly<{ key: string; name: "MarketForm"; params?: { id?: number } }>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const id = route.params?.id;
  const { data } = useGetItemQuery(id!, { skip: !id });
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const store = useStore();
  const theme = useTheme();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [contact_phone, setPhone] = useState("");
  const [contact_link, setLink] = useState("");
  const [status, setStatus] = useState<"available" | "sold">("available");
  const [image_url, setImageUrl] = useState("");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setPrice(String(data.price ?? ""));
      setCategory(data.category ?? "");
      setPhone(data.contact_phone ?? "");
      setLink(data.contact_link ?? "");
      setStatus(data.status);
      setImageUrl(data.image_url ?? "");
    }
  }, [data]);

  const onSave = async () => {
    const payload: {
      title: string;
      description?: string;
      price: number;
      category?: string;
      contact_phone?: string;
      contact_link?: string;
      status: "available" | "sold";
      image_url?: string;
    } = {
      title,
      description,
      price: Number(price) || 0,
      category: category || undefined,
      contact_phone: contact_phone || undefined,
      contact_link: contact_link || undefined,
      status,
      image_url: image_url || undefined,
    };
    try {
      if (id) {
        await updateItem({ id, data: payload }).unwrap();
      } else {
        await createItem(payload).unwrap();
      }
      nav.goBack();
    } catch {
      Alert.alert("Error", "Failed to save item. Please try again.");
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && (result.assets?.length ?? 0) > 0) {
      const localUri = result.assets?.[0]?.uri as string;
      try {
        const getRootState = store.getState as unknown as () => RootState;
        const urlPath = await uploadImage(localUri, getRootState);
        setImageUrl(urlPath);
      } catch {
        // silently skip
      }
    }
  };

  const imageDisplayUri = image_url
    ? image_url.startsWith("http") ? image_url : BASE_URL.replace(/\/api$/, "") + image_url
    : null;

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader name={id ? "Edit Item" : "Sell an Item"} navigation={nav} />

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 80, damping: 18, stiffness: 160 }}
          >
            <GlassCard style={styles.card}>
              <GlassInput label="Title" placeholder="Item title" value={title} onChangeText={setTitle} />
              <GlassInput label="Description" placeholder="Describe the item..." value={description} onChangeText={setDescription} multiline numberOfLines={3} style={{ marginTop: spacing.sm, minHeight: 72, textAlignVertical: "top" }} />
              <GlassInput label="Price ($)" placeholder="0.00" value={price} onChangeText={setPrice} keyboardType="numeric" style={{ marginTop: spacing.sm }} />
              <GlassInput label="Category" placeholder="e.g. Books, Electronics" value={category} onChangeText={setCategory} style={{ marginTop: spacing.sm }} />
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Contact Details</Text>
              <GlassInput label="Phone" placeholder="+1 234 567 8900" value={contact_phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ marginTop: spacing.sm }} />
              <GlassInput label="Link / Social" placeholder="https://" value={contact_link} onChangeText={setLink} style={{ marginTop: spacing.sm }} />
            </GlassCard>

            {/* Image section */}
            <GlassCard style={styles.card}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Image</Text>
              <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.8}
                style={[styles.imagePicker, { borderColor: theme.border, backgroundColor: theme.chip }]}
              >
                <Icon name="image-plus" size={28} color={theme.primary} />
                <Text style={[styles.imagePickerText, { color: theme.primary }]}>Pick Image</Text>
              </TouchableOpacity>
              {imageDisplayUri ? (
                <Image source={{ uri: imageDisplayUri }} style={styles.previewImage} resizeMode="cover" />
              ) : null}
            </GlassCard>

            {/* Status toggle � only when editing */}
            {id ? (
              <GlassCard style={styles.card}>
                <View style={styles.switchRow}>
                  <Text style={[styles.sectionLabel, { color: theme.text }]}>Mark as Sold</Text>
                  <Switch
                    value={status === "sold"}
                    onValueChange={(v) => setStatus(v ? "sold" : "available")}
                    trackColor={{ true: theme.primary, false: theme.chip }}
                    thumbColor="#fff"
                  />
                </View>
              </GlassCard>
            ) : null}

            <GlassButton
              title={id ? "Update Listing" : "Create Listing"}
              onPress={onSave}
              loading={isCreating || isUpdating}
              disabled={!title.trim()}
              style={styles.saveBtn}
            />
          </MotiView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  card: { padding: spacing.lg, marginBottom: spacing.md },
  sectionLabel: { fontSize: 15, fontWeight: "700", marginBottom: spacing.xs },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginTop: spacing.sm,
  },
  imagePickerText: { fontSize: 15, fontWeight: "600" },
  previewImage: { width: "100%", height: 180, borderRadius: radius.md, marginTop: spacing.md },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  saveBtn: { marginHorizontal: 0 },
});

export default MarketFormScreen;
