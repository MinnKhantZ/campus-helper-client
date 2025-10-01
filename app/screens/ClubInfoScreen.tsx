import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Avatar, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useGetClubByIdQuery, useGetAnnouncementsQuery, usePostAnnouncementMutation, useApproveJoinMutation, useDeleteClubMutation } from '../api/Club';
import { useUsersLookupQuery } from '../api/User';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const ClubInfoScreen = () => {
  const route = useRoute();
  const nav = useNavigation() as { navigate: (s: string, p?: unknown) => void };
  const params = (route as unknown as { params?: Record<string, unknown> }).params || {};
  const id = Number(params.id);
  const { data: club, isLoading, refetch } = useGetClubByIdQuery(id);
  const { data: anns, refetch: refetchAnns, isFetching: loadingAnns } = useGetAnnouncementsQuery(id);
  const memberIds = (club?.student_ids || []).concat(club?.admin_id ? [club.admin_id] : []);
  const { data: members } = useUsersLookupQuery(memberIds, { skip: !memberIds.length });
  const [content, setContent] = useState('');
  const [postAnnouncement, { isLoading: posting }] = usePostAnnouncementMutation();
  const [approveJoin, { isLoading: approving }] = useApproveJoinMutation();
  const [deleteClub, { isLoading: deleting }] = useDeleteClubMutation();
  const user = useSelector((s: RootState) => s.auth.user);

  const isOwner = !!user && club && club.admin_id === user.id;
  const isAdmin = !!user && user.role === 'admin';

  const onPost = async () => {
    if (!content.trim()) return;
    try {
      await postAnnouncement({ id, content }).unwrap();
      setContent('');
      refetchAnns();
    } catch (e) { console.warn(e); }
  };

  const onApprove = async (userId: number) => {
    try { await approveJoin({ id, userId }).unwrap(); refetch(); } catch (e) { console.warn(e); }
  };

  const onDelete = () => {
    Alert.alert('Delete Club', 'Are you sure you want to delete this club?', [
      { text: 'Cancel', style: 'cancel' },
  { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteClub(id).unwrap(); } catch (e) { console.warn(e); } } },
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
              {members && members.length ? (
                <View style={{ marginTop: 8 }}>
                  {members.map((m) => (
                    <Text key={m.id}>• {m.name} ({m.role})</Text>
                  ))}
                </View>
              ) : null}
              {(isOwner || isAdmin) && club.pending_ids?.length ? (
                <View style={{ marginTop: 12 }}>
                  <Text variant="titleMedium">Pending Requests</Text>
                  {club.pending_ids.map((uid: number) => (
                    <View key={uid} style={styles.pendingRow}>
                      <Text>User #{uid}</Text>
                      <Button mode="contained" onPress={() => onApprove(uid)} loading={approving}>Approve</Button>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card.Content>
            <Card.Actions>
              {(isOwner || isAdmin) && [
                <Button key="edit" onPress={() => nav.navigate('ClubForm', { id })}>Edit</Button>,
                <Button key="delete" mode="contained" buttonColor="red" onPress={onDelete} loading={deleting}>Delete</Button>,
              ]}
              <Button mode="contained" onPress={() => nav.navigate('ClubChat', { id })}>Open Chat</Button>
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
          <Card.Title title={item.author ? item.author.name : `User #${item.user_id}`} left={(p) => <Avatar.Text {...p} label={(item.author?.name || 'U').slice(0,1)} />} />
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
