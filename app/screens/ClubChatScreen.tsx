import { useEffect, useRef, useState } from "react";
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Text,
  TextInput,
} from "react-native-paper";
import { useRoute, RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../Navigation";
import {
  useGetClubMessagesQuery,
  useSendClubMessageMutation,
} from "../api/Message";
import type { ClubMessage } from "../types";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

const ClubChatScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, "ClubChat">>();
  const id = Number(route.params?.id);
  const { data, refetch, isFetching } = useGetClubMessagesQuery({
    clubId: id,
    limit: 100,
  });
  const [sendMessage, { isLoading }] = useSendClubMessageMutation();
  const [text, setText] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      refetch();
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refetch]);

  const onSend = async () => {
    if (!text.trim()) return;
    try {
      await sendMessage({ clubId: id, content: text.trim() }).unwrap();
      setText("");
      refetch();
    } catch (e) {
      console.warn(e);
    }
  };

  const renderItem = ({ item }: { item: ClubMessage }) => (
    <Card style={{ marginHorizontal: 12, marginVertical: 6 }}>
      <Card.Title
        title={item.author ? item.author.name : `User #${item.user_id}`}
        left={(p) => (
          <Avatar.Text {...p} label={(item.author?.name || "U").slice(0, 1)} />
        )}
      />
      <Card.Content>
        <Text>{item.content}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Appbar.Header>
          <Appbar.Content title="Club Chat" />
        </Appbar.Header>
        <FlatList
          data={data || []}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          refreshing={isFetching}
          onRefresh={() => refetch()}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
        <View
          style={{
            flexDirection: "row",
            padding: 8,
            gap: 8,
            alignItems: "center",
          }}
        >
          <TextInput
            style={{ flex: 1 }}
            value={text}
            onChangeText={setText}
            placeholder="Type a message"
          />
          <Button
            mode="contained"
            onPress={onSend}
            loading={isLoading}
            disabled={!text.trim()}
          >
            Send
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
})

export default ClubChatScreen;
