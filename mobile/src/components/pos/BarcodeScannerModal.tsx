import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useBusinessDataStore } from '../../store/useBusinessDataStore';
import { usePOSStore } from '../../store/usePOSStore';
import { Scan, X, Check, Flashlight, Camera } from 'lucide-react-native';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ visible, onClose }) => {
  const [scannedBarcode, setScannedBarcode] = useState('');
  const { products } = useBusinessDataStore();
  const { addToCart } = usePOSStore();
  const [torch, setTorch] = useState(false);

  const handleScan = (barcode: string) => {
    const product = products.find(
      (p) => p.barcode === barcode || p.sku.toLowerCase() === barcode.toLowerCase()
    );

    if (product) {
      addToCart(product, 1);
      Alert.alert('Product Scanned', `Added ${product.name} ($${product.sellingPrice}) to cart.`);
      setScannedBarcode('');
      onClose();
    } else {
      Alert.alert('Not Found', `No product matching barcode "${barcode}" found in inventory.`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Scan size={20} color={colors.primaryLight} style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>POS Barcode Scanner</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Camera Scanner Viewport Mock */}
          <View style={styles.viewport}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <View style={styles.laserLine} />
            </View>

            <TouchableOpacity
              style={[styles.torchBtn, torch && styles.torchActive]}
              onPress={() => setTorch(!torch)}
            >
              <Flashlight size={18} color={torch ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.torchText, torch && { color: '#FFF' }]}>
                {torch ? 'Flash ON' : 'Flash OFF'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.scanInstruction}>Align product barcode within frame</Text>
          </View>

          {/* Quick Demo Scan Buttons */}
          <View style={styles.quickScanSection}>
            <Text style={styles.sectionLabel}>TAP TO TEST QUICK SCANS:</Text>
            <View style={styles.chipRow}>
              {products.slice(0, 3).map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={styles.chip}
                  onPress={() => handleScan(prod.barcode)}
                >
                  <Text style={styles.chipText} numberOfLines={1}>
                    📦 {prod.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Manual Input */}
          <View style={styles.manualInputRow}>
            <TextInput
              style={styles.input}
              placeholder="Or enter Barcode / SKU manually..."
              placeholderTextColor={colors.textMuted}
              value={scannedBarcode}
              onChangeText={setScannedBarcode}
              keyboardType="default"
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => scannedBarcode && handleScan(scannedBarcode)}
            >
              <Check size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
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
    marginBottom: 16,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  viewport: {
    height: 200,
    backgroundColor: '#050B14',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  viewfinder: {
    width: 220,
    height: 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.primary,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  laserLine: {
    width: '100%',
    height: 2,
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowRadius: 6,
    shadowOpacity: 0.8,
  },
  torchBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  torchActive: {
    backgroundColor: colors.primary,
  },
  torchText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  scanInstruction: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 10,
  },
  quickScanSection: {
    marginTop: 16,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '48%',
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  manualInputRow: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
