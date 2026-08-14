import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { Header } from '../../../components/common/Header';
import { AddProductModal } from '../../../components/inventory/AddProductModal';
import { StockAdjustmentModal } from '../../../components/inventory/StockAdjustmentModal';
import { useBusinessDataStore } from '../../../store/useBusinessDataStore';
import { Product } from '../../../types';
import { colors } from '../../../theme/colors';
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';

export default function InventoryScreen() {
  const { products, categories, stockMovements } = useBusinessDataStore();
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'MOVEMENTS'>('CATALOG');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  const [addProductOpen, setAddProductOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProdForAdjust, setSelectedProdForAdjust] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'ALL' || p.categoryId === selectedCat;
    const matchesQuery =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <View style={styles.container}>
      <Header title="Inventory & Stock" subtitle="Product Catalog & Stock Movements" />

      <View style={styles.tabSwitcherRow}>
        <TouchableOpacity
          style={[styles.segmentTab, activeTab === 'CATALOG' && styles.segmentTabActive]}
          onPress={() => setActiveTab('CATALOG')}
        >
          <Package size={16} color={activeTab === 'CATALOG' ? colors.primaryLight : colors.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.segmentTabText, activeTab === 'CATALOG' && styles.segmentTabTextActive]}>
            Products Catalog ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentTab, activeTab === 'MOVEMENTS' && styles.segmentTabActive]}
          onPress={() => setActiveTab('MOVEMENTS')}
        >
          <Layers size={16} color={activeTab === 'MOVEMENTS' ? colors.primaryLight : colors.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.segmentTabText, activeTab === 'MOVEMENTS' && styles.segmentTabTextActive]}>
            Stock Ledger ({stockMovements.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'CATALOG' ? (
        <View style={styles.body}>
          <View style={styles.actionBar}>
            <View style={styles.searchBox}>
              <Search size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Filter by product name, SKU..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setAddProductOpen(true)}
            >
              <Plus size={18} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => {
                setSelectedProdForAdjust(null);
                setAdjustModalOpen(true);
              }}
            >
              <RefreshCw size={18} color={colors.primaryLight} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8, maxHeight: 36 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
              <TouchableOpacity
                style={[styles.catPill, selectedCat === 'ALL' && styles.catPillActive]}
                onPress={() => setSelectedCat('ALL')}
              >
                <Text style={[styles.catPillText, selectedCat === 'ALL' && styles.catPillTextActive]}>
                  All Categories
                </Text>
              </TouchableOpacity>

              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catPill, selectedCat === c.id && styles.catPillActive]}
                  onPress={() => setSelectedCat(c.id)}
                >
                  <Text style={[styles.catPillText, selectedCat === c.id && styles.catPillTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 20 }}
            renderItem={({ item }) => {
              const isLow = item.stockQuantity <= item.minimumStock;
              return (
                <View style={styles.prodCard}>
                  <Image source={{ uri: item.imageUrl }} style={styles.prodImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prodTitle}>{item.name}</Text>
                    <Text style={styles.prodSub}>SKU: {item.sku} • {item.categoryName}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.costPrice}>Cost: ${item.costPrice.toFixed(2)}</Text>
                      <Text style={styles.sellPrice}>Sell: ${item.sellingPrice.toFixed(2)}</Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <View
                      style={[
                        styles.stockBadge,
                        isLow ? { backgroundColor: colors.warningBg } : { backgroundColor: colors.successBg },
                      ]}
                    >
                      {isLow && <AlertTriangle size={12} color={colors.warning} style={{ marginRight: 4 }} />}
                      <Text
                        style={[
                          styles.stockBadgeText,
                          isLow ? { color: colors.warning } : { color: colors.success },
                        ]}
                      >
                        {item.stockQuantity} {item.unit}s
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.quickAdjustBtn}
                      onPress={() => {
                        setSelectedProdForAdjust(item);
                        setAdjustModalOpen(true);
                      }}
                    >
                      <Text style={styles.quickAdjustText}>Adjust</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </View>
      ) : (
        <FlatList
          data={stockMovements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, padding: 16 }}
          renderItem={({ item }) => {
            const isOut =
              item.movementType === 'SALE' ||
              item.movementType === 'ADJUSTMENT_OUT' ||
              item.movementType === 'DAMAGE' ||
              item.movementType === 'EXPIRED';

            return (
              <View style={styles.ledgerCard}>
                <View
                  style={[
                    styles.movementIcon,
                    isOut ? { backgroundColor: colors.dangerBg } : { backgroundColor: colors.successBg },
                  ]}
                >
                  {isOut ? (
                    <ArrowUpRight size={18} color={colors.danger} />
                  ) : (
                    <ArrowDownLeft size={18} color={colors.success} />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.ledgerProd}>{item.productName}</Text>
                  <Text style={styles.ledgerMeta}>
                    {item.movementType} • By {item.createdBy}
                  </Text>
                  {item.notes && <Text style={styles.ledgerNotes}>Note: {item.notes}</Text>}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.qtyDelta,
                      isOut ? { color: colors.danger } : { color: colors.success },
                    ]}
                  >
                    {isOut ? '-' : '+'}{item.quantity} units
                  </Text>
                  <Text style={styles.ledgerTime}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <AddProductModal visible={addProductOpen} onClose={() => setAddProductOpen(false)} />
      <StockAdjustmentModal
        visible={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        product={selectedProdForAdjust}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabSwitcherRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentTabActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  segmentTabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  segmentTabTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
  },
  addBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtn: {
    backgroundColor: colors.primaryBg,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catPill: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catPillActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  catPillText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  catPillTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  prodCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prodImg: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  prodTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  prodSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  costPrice: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  sellPrice: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickAdjustBtn: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAdjustText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
  },
  ledgerCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  movementIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledgerProd: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  ledgerMeta: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  ledgerNotes: {
    color: colors.textMuted,
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  qtyDelta: {
    fontSize: 14,
    fontWeight: '800',
  },
  ledgerTime: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
