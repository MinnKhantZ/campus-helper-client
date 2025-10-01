import { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Chip, Divider, IconButton, List } from 'react-native-paper';
import { useListItemsQuery, useDeleteItemMutation } from '../api/Marketplace';
import type { MarketplaceItem } from '../types';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation';
import Colors from '../constants/Colors';

const MarketplaceScreen = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [status, setStatus] = useState<'available' | 'sold' | undefined>('available');
  const [sort, setSort] = useState('createdAt:desc');
  const { data, isFetching, refetch } = useListItemsQuery({ q, category, status, sort });
  const [delItem] = useDeleteItemMutation();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const categories = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach(i => { if (i.category) set.add(i.category); });
    return Array.from(set);
  }, [data]);

  const onDelete = async (id: number) => {
    try { await delItem(id).unwrap(); } catch { /* noop */ }
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <List.Item
      title={`${item.title} — $${item.price.toFixed(2)}`}
      description={item.description}
      left={(props) => <List.Icon {...props} icon={item.status === 'available' ? 'cart' : 'cart-off'} />}
      right={() => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.contact_phone ? (
            <IconButton icon="phone" onPress={() => Linking.openURL(`tel:${item.contact_phone}`)} />
          ) : null}
          {item.contact_link ? (
            <IconButton icon="web" onPress={() => Linking.openURL(item.contact_link!)} />
          ) : null}
          {(user?.role === 'admin' || user?.id === item.user_id) && (
            <>
              <IconButton icon="pencil" onPress={() => nav.navigate('MarketForm', { id: item.id })} />
              <IconButton icon="delete" onPress={() => onDelete(item.id)} />
            </>
          )}
        </View>
      )}
      onPress={() => nav.navigate('MarketDetail', { id: item.id })}
      onLongPress={() => (user?.role === 'admin' || user?.id === item.user_id) ? onDelete(item.id) : undefined}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput
          style={{ flex: 1 }}
          placeholder="Search items"
          value={q}
          onChangeText={setQ}
          left={<TextInput.Icon icon="magnify" />}
        />
        <Button mode="outlined" style={{ marginLeft: 8 }} onPress={() => {
          setSort((prev) => {
            if (prev === 'createdAt:desc') return 'createdAt:asc';
            if (prev === 'createdAt:asc') return 'price:asc';
            if (prev === 'price:asc') return 'price:desc';
            return 'createdAt:desc';
          });
        }}>
          Sort
        </Button>
      </View>
      <View style={styles.filtersRow}>
        <Chip selected={!category} onPress={() => setCategory(undefined)} style={styles.chip}>All</Chip>
        {categories.map((c) => (
          <Chip key={c} selected={category === c} onPress={() => setCategory(c)} style={styles.chip}>{c}</Chip>
        ))}
        <View style={{ flex: 1 }} />
        <Chip selected={status === 'available'} onPress={() => setStatus(status === 'available' ? undefined : 'available')} style={styles.chip}>Available</Chip>
        <Chip selected={status === 'sold'} onPress={() => setStatus(status === 'sold' ? undefined : 'sold')} style={styles.chip}>Sold</Chip>
      </View>
      <Divider />
      <FlatList
        data={data ?? []}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        refreshing={isFetching}
        onRefresh={refetch}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={<View style={styles.empty}><Text>No items</Text></View>}
      />
      <Button mode="contained" style={styles.fab} icon="plus" onPress={() => nav.navigate('MarketForm')}>Sell an item</Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  toolbar: { flexDirection: 'row', padding: 12, gap: 8 },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingBottom: 8, alignItems: 'center' },
  chip: { marginRight: 6, marginVertical: 4 },
  empty: { padding: 24, alignItems: 'center' },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 999 },
});

export default MarketplaceScreen;
