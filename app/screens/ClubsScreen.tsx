import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { Card, Text, Button, FAB, Avatar, ActivityIndicator } from "react-native-paper";
import { useGetAllClubsQuery, useGetMyClubsQuery, useRequestJoinMutation } from "../api/Club";
import type { ClubItem } from "../types";
import Colors from "../constants/Colors";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

const Tab = createMaterialTopTabNavigator();

type NavType = { navigate: (screen: string, params?: unknown) => void };

const ClubRow = ({ club, onPress, onJoin, isJoined, isPending }: { club: ClubItem; onPress: () => void; onJoin: () => void; isJoined: boolean; isPending: boolean; }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Title
        title={club.name}
        subtitle={club.description || ""}
        left={(props) => <Avatar.Icon {...props} icon="account-group" />}
      />
      <Card.Actions>
        <Text style={{ marginRight: 'auto' }}>{club.student_ids?.length || 0} members</Text>
        {isJoined ? (
          <Button icon="check" mode="contained-tonal" disabled>
            Joined
          </Button>
        ) : (
          <Button icon="account-plus" mode="contained" onPress={onJoin} disabled={isPending}>
            {isPending ? 'Requested' : 'Join'}
          </Button>
        )}
      </Card.Actions>
    </Card>
  );
};

const AllClubsTab = () => {
  const nav = useNavigation() as unknown as NavType;
  const { data, isLoading, refetch, isFetching } = useGetAllClubsQuery();
  const [requestJoin, { isLoading: joining }] = useRequestJoinMutation();
  const user = useSelector((s: RootState) => s.auth.user);

  const handleJoin = useCallback(async (id: number) => {
    try { await requestJoin(id).unwrap(); } catch (e) { console.warn(e); }
  }, [requestJoin]);

  const renderItem = ({ item }: { item: ClubItem }) => {
    const isJoined = !!user && (item.admin_id === user.id || item.student_ids?.includes(user.id));
    const isPending = !!user && item.pending_ids?.includes(user.id);
    return (
      <ClubRow
        club={item}
  onPress={() => nav.navigate('ClubInfo', { id: item.id })}
        onJoin={() => handleJoin(item.id)}
        isJoined={!!isJoined}
        isPending={!!isPending}
      />
    );
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <FlatList
      data={data || []}
      keyExtractor={(i) => String(i.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching || joining} onRefresh={refetch} />}
    />
  );
};

const JoinedClubsTab = () => {
  const nav = useNavigation() as unknown as NavType;
  const { data, isLoading, refetch, isFetching } = useGetMyClubsQuery();
  // const user = useSelector((s: RootState) => s.auth.user);

  const renderItem = ({ item }: { item: ClubItem }) => (
    <ClubRow
      club={item}
      onPress={() => nav.navigate('ClubInfo', { id: item.id })}
      onJoin={() => {}}
      isJoined={true}
      isPending={false}
    />
  );

  if (isLoading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <FlatList
      data={data || []}
      keyExtractor={(i) => String(i.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
    />
  );
};

const ClubsScreen = () => {
  const nav = useNavigation() as unknown as NavType;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarIndicatorStyle: { backgroundColor: Colors.primary },
        }}
      >
        <Tab.Screen name="All" component={AllClubsTab} />
        <Tab.Screen name="Joined" component={JoinedClubsTab} />
      </Tab.Navigator>
  <FAB style={[styles.fab, { backgroundColor: Colors.primary }]} icon="plus" onPress={() => nav.navigate('ClubForm')} label="New Club" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: { padding: 12 },
  card: { marginBottom: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});

export default ClubsScreen;
