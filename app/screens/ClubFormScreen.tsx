import { View, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation';
import { TextInput, Button, Card } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useCreateClubMutation, useGetClubByIdQuery, useUpdateClubMutation } from '../api/Club';

const ClubFormScreen = () => {
  const route = useRoute();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const params = (route as unknown as { params?: Record<string, unknown> }).params || {};
  const editId = Number(params.id);
  const isEdit = Number.isFinite(editId);
  const { data: club } = useGetClubByIdQuery(editId, { skip: !isEdit });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createClub, { isLoading: creating }] = useCreateClubMutation();
  const [updateClub, { isLoading: updating }] = useUpdateClubMutation();

  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setDescription(club.description || '');
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
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <View style={styles.container}>
      <Card>
        <Card.Title title={isEdit ? 'Edit Club' : 'Create Club'} />
        <Card.Content>
          <TextInput label="Name" value={name} onChangeText={setName} style={{ marginBottom: 12 }} />
          <TextInput label="Description" value={description} onChangeText={setDescription} multiline />
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={onSubmit} loading={creating || updating} disabled={!name.trim()}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
});

export default ClubFormScreen;
