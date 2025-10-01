import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text, Switch } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCreateItemMutation, useGetItemQuery, useUpdateItemMutation } from '../api/Marketplace';
import { useEffect, useState } from 'react';
import type { RootStackParamList } from '../Navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../api/uploadImage';
import { BASE_URL } from '../api/BaseUrl';
import type { RootState } from '../store';
import { useStore } from 'react-redux';

const MarketFormScreen = () => {
  const route = useRoute<Readonly<{ key: string; name: 'MarketForm'; params?: { id?: number } }>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const id = route.params?.id;
  const { data } = useGetItemQuery(id!, { skip: !id });
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const store = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [contact_phone, setPhone] = useState('');
  const [contact_link, setLink] = useState('');
  const [status, setStatus] = useState<'available' | 'sold'>('available');
  const [image_url, setImageUrl] = useState('');

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? '');
      setDescription(data.description ?? '');
      setPrice(String(data.price ?? ''));
      setCategory(data.category ?? '');
      setPhone(data.contact_phone ?? '');
      setLink(data.contact_link ?? '');
  setStatus(data.status);
  setImageUrl(data.image_url ?? '');
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
      status: 'available' | 'sold';
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
    if (id) {
      await updateItem({ id, data: payload }).unwrap();
    } else {
      await createItem(payload).unwrap();
    }
  nav.goBack();
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && (result.assets?.length ?? 0) > 0) {
      const localUri = result.assets?.[0]?.uri as string;
      try {
        const getRootState = store.getState as unknown as () => RootState;
        const urlPath = await uploadImage(localUri, getRootState);
        setImageUrl(urlPath);
  } catch {
        // Optionally show a toast
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput label="Description" value={description} onChangeText={setDescription} style={styles.input} multiline />
      <TextInput label="Price" value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />
      <TextInput label="Category" value={category} onChangeText={setCategory} style={styles.input} />
      <TextInput label="Contact Phone" value={contact_phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput label="Contact Link" value={contact_link} onChangeText={setLink} style={styles.input} />
      <TextInput label="Image URL (optional)" value={image_url} onChangeText={setImageUrl} style={styles.input} />
      <Button mode="outlined" onPress={pickImage}>Pick Image</Button>
      {image_url ? (
        <Image source={{ uri: image_url.startsWith('http') ? image_url : `${BASE_URL.replace(/\/api$/, '')}${image_url}` }} style={{ height: 180, marginTop: 8, borderRadius: 8 }} />
      ) : null}
      {id ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={{ marginRight: 12 }}>Mark as sold</Text>
          <Switch value={status === 'sold'} onValueChange={(v) => setStatus(v ? 'sold' : 'available')} />
        </View>
      ) : null}
      <Button mode="contained" style={{ marginTop: 16 }} onPress={onSave} loading={isCreating || isUpdating}>
        {id ? 'Update' : 'Create'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: { marginBottom: 12 },
});

export default MarketFormScreen;
