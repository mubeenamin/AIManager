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
import { colors } from '../../theme/colors';
import { X, Plus, Package } from 'lucide-react-native';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ visible, onClose }) => {
  const { categories, addProduct } = useBusinessDataStore();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [unit, setUnit] = useState('Piece');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [minimumStock, setMinimumStock] = useState('5');

  const handleSubmit = () => {
    if (!name || !sellingPrice || !costPrice) {
      Alert.alert('Required Fields', 'Please fill in Product Name, Cost Price, and Selling Price.');
      return;
    }

    const generatedSku = sku || 'SKU-' + Math.floor(10000 + Math.random() * 90000);
    const generatedBarcode = barcode || '89012' + Math.floor(100000 + Math.random() * 900000);
    const category = categories.find((c) => c.id === categoryId);

    addProduct({
      businessId: 'biz-1',
      categoryId,
      categoryName: category?.name || 'General',
      name,
      sku: generatedSku,
      barcode: generatedBarcode,
      unit,
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      taxRate: 5,
      minimumStock: parseInt(minimumStock, 10) || 5,
      reorderLevel: parseInt(minimumStock, 10) * 2 || 10,
      trackStock: true,
      stockQuantity: parseInt(stockQuantity, 10) || 0,
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200',
      isActive: true,
    });

    Alert.alert('Product Created', `Added "${name}" to product inventory catalog.`);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setBarcode('');
    setCostPrice('');
    setSellingPrice('');
    setStockQuantity('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Package size={20} color={colors.primaryLight} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Create New Product</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Wireless Mouse M185"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            {/* Category selection */}
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catPill, categoryId === cat.id && styles.catPillActive]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text style={[styles.catPillText, categoryId === cat.id && styles.catPillTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* SKU & Barcode */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>SKU Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Auto-generated if empty"
                  placeholderTextColor={colors.textMuted}
                  value={sku}
                  onChangeText={setSku}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Barcode Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Auto-generated if empty"
                  placeholderTextColor={colors.textMuted}
                  value={barcode}
                  onChangeText={setBarcode}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Price Inputs */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Cost Price ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={costPrice}
                  onChangeText={setCostPrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Selling Price ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Stock Initial Quantity */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Initial Stock Quantity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Min Reorder Threshold</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5"
                  placeholderTextColor={colors.textMuted}
                  value={minimumStock}
                  onChangeText={setMinimumStock}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          {/* Action button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Plus size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.submitText}>Save & Add Product</Text>
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
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  formScroll: {
    marginBottom: 16,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  catPill: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
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
  submitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  submitText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
