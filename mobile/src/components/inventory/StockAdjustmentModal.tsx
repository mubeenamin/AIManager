import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useBusinessDataStore } from '../../store/useBusinessDataStore';
import { Product, StockMovementType } from '../../types';
import { colors } from '../../theme/colors';
import { X, RefreshCw, Layers } from 'lucide-react-native';

interface StockAdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  visible,
  onClose,
  product: selectedProduct,
}) => {
  const { products, addStockMovement } = useBusinessDataStore();

  const [productId, setProductId] = useState(selectedProduct?.id || products[0]?.id || '');
  const [movementType, setMovementType] = useState<StockMovementType>('ADJUSTMENT_IN');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const targetProduct = products.find((p) => p.id === (selectedProduct?.id || productId)) || products[0];

  const handleSave = () => {
    if (!quantity || parseInt(quantity, 10) <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a positive adjustment quantity.');
      return;
    }

    if (!targetProduct) {
      Alert.alert('No Product Selected', 'Please select a product.');
      return;
    }

    const qtyNum = parseInt(quantity, 10);
    addStockMovement({
      businessId: 'biz-1',
      branchId: 'branch-1',
      productId: targetProduct.id,
      productName: targetProduct.name,
      movementType,
      quantity: qtyNum,
      unitCost: targetProduct.costPrice,
      notes: notes || `Manual stock adjustment (${movementType})`,
      createdBy: 'Mubeen',
    });

    Alert.alert(
      'Stock Updated',
      `Adjusted ${targetProduct.name} by ${movementType.includes('OUT') || movementType === 'DAMAGE' || movementType === 'EXPIRED' ? '-' : '+'}${qtyNum} units.`
    );
    setQuantity('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RefreshCw size={20} color={colors.primaryLight} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Stock Adjustment / Transfer</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Product selector if not passed */}
          {!selectedProduct && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.label}>Select Target Product</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {products.map((prod) => (
                    <TouchableOpacity
                      key={prod.id}
                      style={[styles.prodPill, productId === prod.id && styles.prodPillActive]}
                      onPress={() => setProductId(prod.id)}
                    >
                      <Text style={[styles.prodPillText, productId === prod.id && styles.prodPillTextActive]}>
                        {prod.name} ({prod.stockQuantity})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {targetProduct && (
            <View style={styles.stockSummaryCard}>
              <Text style={styles.prodName}>{targetProduct.name}</Text>
              <Text style={styles.currentStockText}>
                Current Stock Balance: <Text style={{ color: colors.primaryLight, fontWeight: '800' }}>{targetProduct.stockQuantity} {targetProduct.unit}s</Text>
              </Text>
            </View>
          )}

          {/* Adjustment Reason / Type */}
          <Text style={styles.label}>Adjustment Reason / Type</Text>
          <View style={styles.typeGrid}>
            {[
              { type: 'ADJUSTMENT_IN', label: '+ Stock In / Found' },
              { type: 'ADJUSTMENT_OUT', label: '- Stock Out / Correction' },
              { type: 'DAMAGE', label: '⚠️ Damaged Goods' },
              { type: 'EXPIRED', label: '⏳ Expired Products' },
            ].map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[styles.typeBtn, movementType === item.type && styles.typeBtnActive]}
                onPress={() => setMovementType(item.type as StockMovementType)}
              >
                <Text style={[styles.typeBtnText, movementType === item.type && styles.typeBtnTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quantity */}
          <Text style={styles.label}>Quantity to Adjust *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 10"
            placeholderTextColor={colors.textMuted}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          {/* Notes */}
          <Text style={styles.label}>Audit Reason / Notes</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Broken box packaging during delivery"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
            <Layers size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.submitText}>Confirm Stock Ledger Adjustment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  stockSummaryCard: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prodName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  currentStockText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  prodPill: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prodPillActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  prodPillText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  prodPillTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  typeBtn: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    width: '48%',
  },
  typeBtnActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  typeBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: colors.primaryLight,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  submitText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
