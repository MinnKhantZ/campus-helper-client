import { View, StyleSheet, Image, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { useGetItemQuery, useDeleteItemMutation } from '../api/Marketplace';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { RootStackParamList } from '../Navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BASE_URL } from '../api/BaseUrl';
import Colors from '../constants/Colors';

const MarketDetailScreen = () => {
  const route = useRoute<Readonly<{ key: string; name: 'MarketDetail'; params: { id: number } }>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { id } = route.params;
  const { data: item } = useGetItemQuery(id);
  const user = useSelector((s: RootState) => s.auth.user);
  const [delItem] = useDeleteItemMutation();

  if (!item) return null;

  const canEdit = user?.role === 'admin' || user?.id === item.user_id;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${BASE_URL.replace(/\/api$/, '')}${item.image_url}` }} style={styles.image} />
      ) : null}
      <Text variant="headlineSmall">{item.title}</Text>
      <View style={styles.row}>
        <Chip icon="tag">${item.price.toFixed(2)}</Chip>
        {item.category ? <Chip style={{ marginLeft: 8 }}>{item.category}</Chip> : null}
        <Chip style={{ marginLeft: 8 }} icon={item.status === 'available' ? 'check' : 'close'}>{item.status}</Chip>
      </View>
      <Divider style={{ marginVertical: 8 }} />
      {item.description ? <Text>{item.description}</Text> : null}
      <Divider style={{ marginVertical: 8 }} />
      <View style={styles.row}>
        {item.contact_phone ? (
          <Button mode="contained" icon="phone" onPress={() => Linking.openURL(`tel:${item.contact_phone}`)}>
            Call Seller
          </Button>
        ) : null}
        {item.contact_link ? (
          <Button mode="outlined" icon="web" style={{ marginLeft: 8 }} onPress={() => Linking.openURL(item.contact_link!)}>
            Open Link
          </Button>
        ) : null}
      </View>
      {canEdit ? (
        <View style={[styles.row, { marginTop: 16 }]}>
          <Button icon="pencil" onPress={() => nav.navigate('MarketForm', { id: item.id })}>Edit</Button>
          <Button icon="delete" textColor="red" onPress={async () => { await delItem(item.id).unwrap(); nav.goBack(); }}>Delete</Button>
        </View>
      ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  image: { width: '100%', height: 220, borderRadius: 8, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});

export default MarketDetailScreen;
