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
  Alert,
} from 'react-native';
import { Header } from '../../../components/common/Header';
import { BarcodeScannerModal } from '../../../components/pos/BarcodeScannerModal';
import { ReceiptModal } from '../../../components/pos/ReceiptModal';
import { HoldSalesModal } from '../../../components/pos/HoldSalesModal';
import { useBusinessDataStore } from '../../../store/useBusinessDataStore';
import { usePOSStore } from '../../../store/usePOSStore';
import { Sale, PaymentMethod } from '../../../types';
import { colors } from '../../../theme/colors';
import {
  Search,
  Scan,
  Plus,
  Minus,
  User,
  Clock,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react-native';

export default function POSScreen() {
  const { categories, products, customers, recordSaleTransaction } = useBusinessDataStore();
  const {
    cart,
    selectedCustomer,
    discountPercentage,
    taxRate,
    searchQuery,
    selectedCategory,
    heldSales,
    addToCart,
    removeFromCart,
    updateQuantity,
    setCustomer,
    setSearchQuery,
    setSelectedCategory,
    clearCart,
    holdCurrentSale,
    getSubtotal,
    getDiscountAmount,
    getTaxAmount,
    getTotalAmount,
  } = usePOSStore();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [holdModalOpen, setHoldModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CASH');

  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === 'ALL' || prod.categoryId === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.barcode.includes(searchQuery);
    return matchesCat && matchesQuery && prod.isActive;
  });

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add products to cart before completing checkout.');
      return;
    }

    const sale = recordSaleTransaction({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      items: cart,
      subtotal: getSubtotal(),
      discountAmount: getDiscountAmount(),
      taxAmount: getTaxAmount(),
      totalAmount: getTotalAmount(),
      paidAmount: getTotalAmount(),
      paymentMethod: selectedPaymentMethod,
      cashierName: 'Mubeen',
      cashierId: 'usr-1',
    });

    clearCart();
    setCompletedSale(sale);
    setReceiptOpen(true);
  };

  return (
    <View style={styles.container}>
      <Header title="POS Terminal" subtitle="Point of Sale & Register Checkout" />

      <View style={styles.topBar}>
        <View style={styles.searchWrapper}>
          <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product name, SKU or barcode..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.scanBtn} onPress={() => setScannerOpen(true)}>
          <Scan size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.holdBadgeBtn}
          onPress={() => setHoldModalOpen(true)}
        >
          <Clock size={18} color={colors.warning} />
          {heldSales.length > 0 && (
            <View style={styles.holdCounter}>
              <Text style={styles.holdCounterText}>{heldSales.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
            <TouchableOpacity
              style={[styles.catPill, selectedCategory === 'ALL' && styles.catPillActive]}
              onPress={() => setSelectedCategory('ALL')}
            >
              <Text style={[styles.catPillText, selectedCategory === 'ALL' && styles.catPillTextActive]}>
                All Products ({products.length})
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catPill, selectedCategory === cat.id && styles.catPillActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.catPillText, selectedCategory === cat.id && styles.catPillTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.mainBody}>
        <View style={styles.catalogSection}>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 10 }}
            contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => addToCart(item, 1)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.productCategory}>{item.categoryName}</Text>
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>${item.sellingPrice.toFixed(2)}</Text>
                    <Text
                      style={[
                        styles.stockBadge,
                        item.stockQuantity <= item.minimumStock && { color: colors.warning },
                        item.stockQuantity === 0 && { color: colors.danger },
                      ]}
                    >
                      {item.stockQuantity} in stock
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShoppingBag size={18} color={colors.primaryLight} style={{ marginRight: 6 }} />
              <Text style={styles.cartTitle}>Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</Text>
            </View>

            {cart.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.customerSelector}>
            <User size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {customers.map((cust) => (
                  <TouchableOpacity
                    key={cust.id}
                    style={[
                      styles.custChip,
                      (selectedCustomer?.id === cust.id || (!selectedCustomer && cust.id === 'cust-3')) &&
                        styles.custChipActive,
                    ]}
                    onPress={() => setCustomer(cust)}
                  >
                    <Text
                      style={[
                        styles.custChipText,
                        (selectedCustomer?.id === cust.id || (!selectedCustomer && cust.id === 'cust-3')) &&
                          styles.custChipTextActive,
                      ]}
                    >
                      {cust.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCartView}>
              <ShoppingBag size={32} color={colors.textMuted} />
              <Text style={styles.emptyCartText}>Cart is empty</Text>
              <Text style={styles.emptyCartSub}>Tap products to add items to transaction</Text>
            </View>
          ) : (
            <ScrollView style={styles.cartItemsScroll} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 8 }}>
                {cart.map((item) => (
                  <View key={item.product.id} style={styles.cartItemCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemTitle} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.cartItemPrice}>
                        ${item.unitPrice.toFixed(2)} x {item.quantity} = ${item.itemTotal.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.qtyControl}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus size={14} color={colors.textPrimary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus size={14} color={colors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <View style={styles.paymentMethodRow}>
            {[
              { type: 'CASH', label: '💵 Cash' },
              { type: 'CARD', label: '💳 Card' },
              { type: 'MOBILE_WALLET', label: '📱 Wallet' },
            ].map((pm) => (
              <TouchableOpacity
                key={pm.type}
                style={[
                  styles.pmChip,
                  selectedPaymentMethod === pm.type && styles.pmChipActive,
                ]}
                onPress={() => setSelectedPaymentMethod(pm.type as PaymentMethod)}
              >
                <Text
                  style={[
                    styles.pmChipText,
                    selectedPaymentMethod === pm.type && styles.pmChipTextActive,
                  ]}
                >
                  {pm.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalVal}>${getSubtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({taxRate}%):</Text>
              <Text style={styles.totalVal}>${getTaxAmount().toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={styles.grandLabel}>PAYABLE:</Text>
              <Text style={styles.grandVal}>${getTotalAmount().toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.cartActionRow}>
            <TouchableOpacity style={styles.holdBtn} onPress={holdCurrentSale}>
              <Clock size={16} color={colors.warning} />
              <Text style={styles.holdBtnText}>Hold</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <CheckCircle2 size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.checkoutBtnText}>PAY ${getTotalAmount().toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <BarcodeScannerModal visible={scannerOpen} onClose={() => setScannerOpen(false)} />
      <HoldSalesModal visible={holdModalOpen} onClose={() => setHoldModalOpen(false)} />
      <ReceiptModal visible={receiptOpen} sale={completedSale} onClose={() => setReceiptOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
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
  scanBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdBadgeBtn: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  holdCounter: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.warning,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdCounterText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  categoryBar: {
    paddingVertical: 10,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  catPill: {
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
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
    fontWeight: '600',
  },
  catPillTextActive: {
    color: colors.primaryLight,
  },
  mainBody: {
    flex: 1,
    flexDirection: 'row',
  },
  catalogSection: {
    flex: 1.2,
    padding: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  productImage: {
    width: '100%',
    height: 90,
    backgroundColor: '#0F172A',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  productCategory: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  productPrice: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '800',
  },
  stockBadge: {
    color: colors.textMuted,
    fontSize: 10,
  },
  cartSection: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    padding: 12,
    justifyContent: 'space-between',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  clearText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  customerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  custChip: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  custChipActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  custChipText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  custChipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  emptyCartView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 8,
  },
  emptyCartSub: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  cartItemsScroll: {
    flex: 1,
    marginVertical: 4,
  },
  cartItemCard: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartItemTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  cartItemPrice: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 6,
  },
  pmChip: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pmChipActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  pmChipText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  pmChipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  totalsCard: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  totalLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  totalVal: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  grandLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  grandVal: {
    color: colors.success,
    fontSize: 15,
    fontWeight: '800',
  },
  cartActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  holdBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  holdBtnText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  checkoutBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
