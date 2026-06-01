import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Avatar, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  useGetClubByIdQuery,
  useGetAnnouncementsQuery,
  usePostAnnouncementMutation,
  useApproveJoinMutation,
  useRejectJoinMutation,
  useLeaveClubMutation,
  useDeleteClubMutation,
} from '../api/Club';
import { useUsersLookupQuery } from '../api/User';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const ClubInfoScreen = () => {
  const route = useRoute();
  const nav = useNavigation() as { navigate: (s: string, p?: unknown) => void; goBack: () => void };
  const params = (route as unknown as { params?: Record<string, unknown> }).params || {};
  const id = Number(params.id);
  const { data: club, isLoading, refetch } = useGetClubByIdQuery(id);
  const { data: anns, refetch: refetchAnns, isFetching: loadingAnns } = useGetAnnouncementsQuery(id);

  const allIdsToLookup = [
    ...(club?.student_ids || []),
    ...(club?.admin_id ? [club.admin_id] : []),
    ...(club?.pending_ids || []),
  ];
  const { data: allUsers } = useUsersLookupQuery(allIdsToLookup, { skip: !allIdsToLookup.length });
  const memberIdSet = new Set([...(club?.student_ids || []), ...(club?.admin_id ? [club.admin_id] : [])]);
  const members = (allUsers || []).filter((u) => memberIdSet.has(u.id));
  const pendingUsers = (allUsers || []).filter((u) => club?.pending_ids?.includes(u.id));

  const [content, setContent] = useState('');
  const [postAnnouncement, { isLoading: posting }] = usePostAnnouncementMutation();
  const [approveJoin, { isLoading: approving }] = useApproveJoinMutation();
  const [rejectJoin, { isLoading: rejecting }] = useRejectJoinMutation();
  const [leaveClub, { isLoading: leaving }] = useLeaveClubMutation();
  const [deleteClub, { isLoading: deleting }] = useDeleteClubMutation();
  const user = useSelector((s: RootState) => s.auth.user);

  const isOwner = !!user && !!club && club.admin_id === user.id;
  const isAdmin = !!user && user.role === 'admin';
  const isMember = !!user && !!club && (club.admin_id === user.id || club.student_ids?.includes(user.id));

  const onPost = async () => {
    if (!content.trim()) return;
    try {
      await postAnnouncement({ id, content }).unwrap();
      setContent('');
      refetchAnns();
    } catch {
      Alert.alert('Error', 'Failed to post announcement. Please try again.');
    }
  };

  const onApprove = async (userId: number) => {
    try {
      await approveJoin({ id, userId }).unwrap();
      refetch();
    } catch {
      Alert.alert('Error', 'Failed to approve request.');
    }
  };

  const onReject = async (userId: number) => {
    try {
      await rejectJoin({ id, userId }).unwrap();
      refetch();
    } catch {
      Alert.alert('Error', 'Failed to reject request.');
    }
  };

  const onLeave = () => {
    Alert.alert('Leave Club', 'Are you sure you want to leave this club?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive', onPress: async () => {
          try {
            await leaveClub(id).unwrap();
            nav.goBack();
          } catch {
            Alert.alert('Error', 'Failed to leave club.');
          }
        },
      },
    ]);
  };

  const onDelete = () => {
    Alert.alert('Delete Club', 'Are you sure you want to delete this club?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteClub(id).unwrap();
            nav.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete club.');
          }
        },
      },
    ]);
  };

  if (isLoading || !club) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <FlatList
      data={anns || []}
      keyExtractor={(i) => String(i.id)}
      ListHeaderComponent={
        <View style={{ padding: 12 }}>
          <Card style={{ marginBottom: 12 }}>
            <Card.Title title={club.name} subtitle={club.description || ''} left={(p) => <Avatar.Icon {...p} icon="account-group" />} />
            <Card.Content>
              <Text>{club.student_ids?.length || 0} members</Text>
              {members.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  {members.map((m) => (
                    <Text key={m.id}>• {m.name} ({m.role})</Text>
                  ))}
                </View>
              )}
              {(isOwner || isAdmin) && (club.pending_ids?.length ?? 0) > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text variant="titleMedium">Pending Requests</Text>
                  {club.pending_ids.map((uid: number) => {
                    const pendingUser = pendingUsers.find((u) => u.id === uid);
                    return (
                      <View key={uid} style={styles.pendingRow}>
                        <Text>{pendingUser ? pendingUser.name : `User #${uid}`}</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Button mode="contained" compact onPress={() => onApprove(uid)} loading={approving}>Approve</Button>
                          <Button mode="outlined" compact onPress={() => onReject(uid)} loading={rejecting}>Reject</Button>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card.Content>
            <Card.Actions>
              {(isOwner || isAdmin) && (
                <>
                  <Button onPress={() => nav.navigate('ClubForm', { id })}>Edit</Button>
                  <Button mode="contained" buttonColor="red" onPress={onDelete} loading={deleting}>Delete</Button>
                </>
              )}
              {isMember && !isOwner && (
                <Button mode="outlined" onPress={onLeave} loading={leaving}>Leave</Button>
              )}
              {isMember && (
                <Button mode="contained" onPress={() => nav.navigate('ClubChat', { id })}>Open Chat</Button>
              )}
            </Card.Actions>
          </Card>

          {(isOwner || isAdmin) && (
            <Card style={{ marginBottom: 12 }}>
              <Card.Title title="Post Announcement" />
              <Card.Content>
                <TextInput value={content} onChangeText={setContent} placeholder="Write an announcement" multiline />
              </Card.Content>
              <Card.Actions>
                <Button mode="contained" onPress={onPost} loading={posting} disabled={!content.trim()}>Post</Button>
              </Card.Actions>
            </Card>
          )}

          <Text variant="titleLarge" style={{ marginVertical: 8 }}>Announcements</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Card style={{ marginHorizontal: 12, marginBottom: 12 }}>
          <Card.Title
            title={item.author ? item.author.name : `User #${item.user_id}`}
            left={(p) => <Avatar.Text {...p} label={(item.author?.name || 'U').slice(0, 1)} />}
          />
          <Card.Content>
            <Text>{item.content}</Text>
          </Card.Content>
        </Card>
      )}
      refreshing={loadingAnns}
      onRefresh={() => { refetch(); refetchAnns(); }}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pendingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
});

export default ClubInfoScreen;
