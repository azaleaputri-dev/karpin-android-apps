import React from 'react';
import {FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import FilterChip from '../components/FilterChip';
import {useAuth} from '../context/AuthContext';
import {fetchChildren} from '../services/mobileData';
import colors from '../theme/colors';
import {borderRadius, spacing} from '../theme/design';

function ChildrenScreen({navigation, route}) {
  const {token, user} = useAuth();
  const [search, setSearch] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [children, setChildren] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');

  const loadChildren = React.useCallback(async isRefresh => {
    try {
      setErrorMessage('');
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const response = await fetchChildren(token, {search: search.trim(), gender});
      setChildren(response.data || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [gender, search, token]);

  React.useEffect(() => {loadChildren(false);}, [loadChildren, route.params?.refreshAt]);

  const debouncedSearch = React.useRef(null);
  function handleSearch(text) {
    setSearch(text);
    if (debouncedSearch.current) clearTimeout(debouncedSearch.current);
    debouncedSearch.current = setTimeout(() => loadChildren(false), 400);
  }

  function renderItem({item}) {
    return (
      <Pressable onPress={() => navigation.navigate('ChildDetail', {childId: item.id, title: item.child_name})}>
        <Card padding="lg" style={styles.childCard}>
          <View style={styles.cardTop}>
            <View style={[styles.avatar, {backgroundColor: item.gender === 'L' ? colors.infoSoft : colors.purpleSoft}]}>
              <Ionicons name={item.gender === 'L' ? 'man' : 'woman'} size={22} color={item.gender === 'L' ? colors.info : colors.purple} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.childName}>{item.child_name}</Text>
              <Text style={styles.metaText}>{item.nik ? `NIK: ${item.nik}` : 'NIK: -'}</Text>
            </View>
            <View style={[styles.genderTag, {backgroundColor: item.gender === 'L' ? colors.infoSoft : colors.purpleSoft}]}>
              <Ionicons name={item.gender === 'L' ? 'man-outline' : 'woman-outline'} size={12} color={item.gender === 'L' ? colors.info : colors.purple} />
              <Text style={[styles.genderText, {color: item.gender === 'L' ? colors.info : colors.purple}]}>{item.gender === 'L' ? 'L' : 'P'}</Text>
            </View>
          </View>
        </Card>
      </Pressable>
    );
  }

  const hasFilters = search || gender;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.content}
        data={children}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={loading ? null : (
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={56} color={colors.border} />
            <EmptyState title={errorMessage || 'Belum ada data anak'} description={errorMessage || 'Belum ada data anak yang cocok.'} />
          </View>
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.searchSection}>
              <View style={styles.searchInputWrap}>
                <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                <TextInput
                  onChangeText={handleSearch}
                  placeholder="Cari nama, NIK, atau UID NFC"
                  placeholderTextColor={colors.placeholder}
                  style={styles.searchInput}
                  value={search}
                />
                {search ? (
                  <Pressable onPress={() => {setSearch(''); loadChildren(false);}}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.filterRow}>
                <FilterChip active={gender === ''} label="Semua" onPress={() => setGender('')} />
                <FilterChip active={gender === 'L'} icon="man-outline" label="Laki-laki" onPress={() => setGender('L')} />
                <FilterChip active={gender === 'P'} icon="woman-outline" label="Perempuan" onPress={() => setGender('P')} />
                {hasFilters ? (
                  <Pressable onPress={() => {setSearch(''); setGender('');}} style={styles.resetBtn}>
                    <Ionicons name="refresh" size={14} color={colors.text} />
                    <Text style={styles.resetText}>Reset</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            {user?.role && !hasFilters ? (
              <Pressable onPress={() => navigation.navigate('CreateChild')} style={styles.addBtn}>
                <Ionicons name="add" size={20} color={colors.white} />
                <Text style={styles.addText}>Tambah Anak</Text>
              </Pressable>
            ) : null}
            {null}
            {loading ? <View style={styles.loadingWrap}><Text style={styles.loadingText}>Memuat...</Text></View> : null}
          </View>
        }
        refreshControl={<RefreshControl colors={[colors.primary]} onRefresh={() => loadChildren(true)} refreshing={refreshing} tintColor={colors.primary} />}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl, paddingBottom: spacing.xxl},
  emptyWrap: {alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.md},
  searchSection: {marginBottom: spacing.md},
  searchInputWrap: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.graySoft, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, gap: spacing.sm},
  searchInput: {flex: 1, paddingVertical: 14, fontSize: 14, color: colors.text},
  filterRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md, alignItems: 'center'},
  resetBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.graySoft},
  resetText: {fontSize: 12, fontWeight: '800', color: colors.text},
  addBtn: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', marginBottom: spacing.md, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3},
  addText: {color: colors.white, fontSize: 14, fontWeight: '800'},
  loadingWrap: {paddingVertical: spacing.xl},
  loadingText: {textAlign: 'center', color: colors.textMuted, fontSize: 14, fontWeight: '600'},
  childCard: {marginBottom: spacing.sm},
  cardTop: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  avatar: {width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center'},
  cardInfo: {flex: 1},
  childName: {fontSize: 16, fontWeight: '800', color: colors.text},
  metaText: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  genderTag: {flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4},
  genderText: {fontSize: 11, fontWeight: '800'},
});

export default ChildrenScreen;
