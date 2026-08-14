import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Sale } from '../../types';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { X, Printer, Share2, CheckCircle2, Building } from 'lucide-react-native';

interface ReceiptModalProps {
  visible: boolean;
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ visible, sale, onClose }) => {
  const { activeBusiness, activeBranch } = useAuthStore();

  if (!sale) return null;

  const handlePrint = () => {
    Alert.alert('Printing Receipt', `Sending ${sale.invoiceNumber} to Bluetooth POS thermal printer...`);
  };

  const handleShare = () => {
    Alert.alert('Digital Receipt', `Receipt link copied! Share via WhatsApp or SMS.`);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckCircle2 size={22} color={colors.success} style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>Transaction Completed</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Thermal Receipt Paper View */}
          <ScrollView style={styles.receiptPaper} contentContainerStyle={{ padding: 16 }}>
            {/* Store Header */}
            <View style={styles.storeHeader}>
              <Text style={styles.storeName}>{activeBusiness?.name || 'Apex Supermarket'}</Text>
              <Text style={styles.storeSub}>{activeBranch?.address || '123 Tech Central Ave'}</Text>
              <Text style={styles.storeSub}>Phone: {activeBusiness?.phone || '+1 800-555-APEX'}</Text>
              {activeBusiness?.taxNumber && (
                <Text style={styles.storeSub}>Tax ID: {activeBusiness.taxNumber}</Text>
              )}
            </View>

            <View style={styles.dividerDot} />

            {/* Meta Row */}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice No:</Text>
              <Text style={styles.metaValue}>{sale.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>
                {new Date(sale.saleDate).toLocaleDateString()} {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Cashier:</Text>
              <Text style={styles.metaValue}>{sale.cashierName}</Text>
            </View>
            {sale.customerName && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Customer:</Text>
                <Text style={styles.metaValue}>{sale.customerName}</Text>
              </View>
            )}

            <View style={styles.dividerLine} />

            {/* Items Table */}
            <View style={styles.itemsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colHead, { flex: 2 }]}>ITEM</Text>
                <Text style={[styles.colHead, { width: 40, textAlign: 'center' }]}>QTY</Text>
                <Text style={[styles.colHead, { width: 60, textAlign: 'right' }]}>TOTAL</Text>
              </View>

              {sale.items.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.itemTitle}>{item.product.name}</Text>
                    <Text style={styles.itemSub}>${item.unitPrice.toFixed(2)} each</Text>
                  </View>
                  <Text style={[styles.itemQty, { width: 40, textAlign: 'center' }]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.itemTotal, { width: 60, textAlign: 'right' }]}>
                    ${item.itemTotal.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.dividerLine} />

            {/* Totals Breakdown */}
            <View style={styles.summaryRow}>
              <Text style={styles.sumLabel}>Subtotal:</Text>
              <Text style={styles.sumValue}>${sale.subtotal.toFixed(2)}</Text>
            </View>

            {sale.discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>Discount:</Text>
                <Text style={[styles.sumValue, { color: colors.success }]}>
                  -${sale.discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.sumLabel}>Tax (5%):</Text>
              <Text style={styles.sumValue}>${sale.taxAmount.toFixed(2)}</Text>
            </View>

            <View style={[styles.summaryRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#334155' }]}>
              <Text style={styles.totalLabel}>TOTAL PAID:</Text>
              <Text style={styles.totalValue}>${sale.totalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.paymentBadgeRow}>
              <Text style={styles.paymentBadge}>
                PAYMENT METHOD: {sale.paymentMethod}
              </Text>
            </View>

            <View style={styles.dividerDot} />

            {/* Footer barcode graphic */}
            <View style={styles.barcodeSection}>
              <Text style={styles.barcodeGraphic}>||| | |||| | ||| |||| | || | |||</Text>
              <Text style={styles.thankYouText}>Thank you for your business!</Text>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
              <Printer size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.btnText}>Print Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 size={18} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.btnText, { color: colors.textPrimary }]}>Share Digital</Text>
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
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBg,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  receiptPaper: {
    backgroundColor: '#0B1120',
  },
  storeHeader: {
    alignItems: 'center',
    marginVertical: 8,
  },
  storeName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  storeSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  dividerDot: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  dividerLine: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  itemsTable: {
    marginVertical: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  colHead: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  itemSub: {
    color: colors.textMuted,
    fontSize: 11,
  },
  itemQty: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  itemTotal: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sumLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  sumValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  totalLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '800',
  },
  paymentBadgeRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  paymentBadge: {
    backgroundColor: colors.primaryBg,
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  barcodeSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  barcodeGraphic: {
    fontFamily: 'Courier',
    fontSize: 18,
    letterSpacing: 3,
    color: colors.textSecondary,
  },
  thankYouText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cardBg,
  },
  printBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
