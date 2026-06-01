import { View, StyleSheet, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCreateClubMutation, useGetClubByIdQuery, useUpdateClubMutation } from "../api/Club";
import GlassCard from "../components/ui/GlassCard";
import GlassInput from "../components/ui/GlassInput";
import GlassButton from "../components/ui/GlassButton";
import ScreenHeader from "../components/ScreenHeader";
import { useTheme, spacing } from "../theme";

const ClubFormScreen = () => {
  const route = useRoute();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const params = (route as unknown as { params?: Record<string, unknown> }).params || {};
  const editId = Number(params.id);
  const isEdit = Number.isFinite(editId) && editId > 0;
  const { data: club } = useGetClubByIdQuery(editId, { skip: !isEdit });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createClub, { isLoading: creating }] = useCreateClubMutation();
  const [updateClub, { isLoading: updating }] = useUpdateClubMutation();
  const theme = useTheme();

  useEffect(() => {
    if (club) {
      setName(club.name || "");
      setDescription(club.description || "");
    }
  }, [club]);

  const onSubmit = async () => {
    if (!name.trim()) return;
    try {
      if (isEdit) {
        await updateClub({ id: editId, payload: { name: name.trim(), description } }).unwrap();
      } else {
        await createClub({ name: name.trim(), description }).unwrap();
      }
      nav.goBack();
    } catch {
      Alert.alert("Error", "Failed to save club. Please try again.");
    }
  };

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader name={isEdit ? "Edit Club" : "Create Club"} navigation={nav} />
        <MotiView
          from={{ opacity: 0, translateY: 24 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 80, damping: 18, stiffness: 160 }}
          style={styles.content}
        >
          <GlassCard style={styles.card}>
            <GlassInput
              label="Club Name"
              placeholder="Enter club name"
              value={name}
              onChangeText={setName}
            />
            <GlassInput
              label="Description"
              placeholder="What is this club about?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={{ marginTop: spacing.sm, minHeight: 96, textAlignVertical: "top" }}
            />
          </GlassCard>
          <GlassButton
            title={isEdit ? "Save Changes" : "Create Club"}
            onPress={onSubmit}
            loading={creating || updating}
            disabled={!name.trim()}
            style={styles.submitBtn}
          />
        </MotiView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: spacing.lg },
  card: { padding: spacing.lg, marginBottom: spacing.md },
  submitBtn: { marginHorizontal: 0 },
});

export default ClubFormScreen;
