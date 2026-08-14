import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { usePOSStore } from '../../store/usePOSStore';
import { colors } from '../../theme/colors';
import { X, Play, Trash2, Clock, ShoppingCart } from 'lucide-react-native';

interface HoldSalesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HoldSalesModal: React.FC<HoldSalesModalProps> = ({ visible, onClose }) => {
  const { heldSales, resumeSale, cancelHeldSale } = usePOSStore();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={20} color={colors.warning} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Held Sales ({heldSales.length})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {heldSales.length === 0 ? (
            <View style={styles.emptyState}>
              <ShoppingCart size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>No held transactions found</Text>
              <Text style={styles.emptySub}>
                You can hold any active cart from the POS checkout screen and resume it later.
              </Text>
            </View>
          ) : (
            <FlatList
              data={heldSales}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 12, paddingVertical: 10 }}
              renderItem={({ item }) => {
                const totalAmount = item.items.reduce((s, i) => s + i.itemTotal, 0);
                return (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.holdCode}>{item.holdCode}</Text>
                        <Text style={styles.heldTime}>Held at {item.heldAt}</Text>
                      </View>
                      <Text style={styles.totalBadge}>${totalAmount.toFixed(2)}</Text>
                    </View>

                    {item.customer && (
                      <Text style={styles.customerText}>Customer: {item.customer.name}</Text>
                    )}

                    <Text style={styles.itemCount}>
                      {item.items.length} item(s): {item.items.map((i) => `${i.quantity}x ${i.product.name}`).join(', ')}
                    </Text>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.resumeBtn}
                        onPress={() => {
                          resumeSale(item.id);
                          onClose();
                        }}
                      >
                        <Play size={16} color="#FFF" style={{ marginRight: 6 }} />
                        <Text style={styles.resumeText}>Resume Cart</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => cancelHeldSale(item.id)}
                      >
                        <Trash2 size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
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
    maxHeight: '80%',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holdCode: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 14,
  },
  heldTime: {
    color: colors.textMuted,
    fontSize: 11,
  },
  totalBadge: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '800',
  },
  customerText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  itemCount: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  resumeBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  resumeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.dangerBg,
  },
});
