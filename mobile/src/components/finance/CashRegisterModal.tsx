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
import { useBusinessDataStore } from '../../store/useBusinessDataStore';
import { colors } from '../../theme/colors';
import { X, Lock, Unlock, Calculator } from 'lucide-react-native';

interface CashRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  mode: 'OPEN' | 'CLOSE';
}

export const CashRegisterModal: React.FC<CashRegisterModalProps> = ({ visible, onClose, mode }) => {
  const { activeCashSession, openCashRegister, closeCashRegister } = useBusinessDataStore();
  const [openingFloat, setOpeningFloat] = useState('200.00');
  const [actualCount, setActualCount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  const handleAction = () => {
    if (mode === 'OPEN') {
      const floatVal = parseFloat(openingFloat) || 0;
      openCashRegister(floatVal, 'Mubeen');
      Alert.alert('Register Opened', `Opened cash drawer with $${floatVal.toFixed(2)} opening float.`);
    } else {
      const actualVal = parseFloat(actualCount);
      if (isNaN(actualVal)) {
        Alert.alert('Count Required', 'Please input the physical cash counted in your drawer.');
        return;
      }
      closeCashRegister(actualVal, closingNotes);
      const diff = actualVal - (activeCashSession?.expectedCash || 0);
      Alert.alert(
        'Register Closed',
        `Closed register session. Cash discrepancy: ${diff === 0 ? 'Exact Match ($0.00)' : diff > 0 ? `+$${diff.toFixed(2)} Surplus` : `-$${Math.abs(diff).toFixed(2)} Shortage`}`
      );
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {mode === 'OPEN' ? (
                <Unlock size={20} color={colors.success} style={{ marginRight: 8 }} />
              ) : (
                <Lock size={20} color={colors.warning} style={{ marginRight: 8 }} />
              )}
              <Text style={styles.title}>
                {mode === 'OPEN' ? 'Open Cash Drawer Session' : 'Daily Cash Register Closing'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {mode === 'OPEN' ? (
            <View>
              <Text style={styles.subtext}>
                Specify starting physical cash float placed in the register drawer for change.
              </Text>

              <Text style={styles.label}>Opening Cash Float ($) *</Text>
              <TextInput
                style={styles.input}
                placeholder="200.00"
                placeholderTextColor={colors.textMuted}
                value={openingFloat}
                onChangeText={setOpeningFloat}
                keyboardType="decimal-pad"
              />

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.success }]} onPress={handleAction}>
                <Unlock size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitText}>Open Register Drawer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Expected Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.sumRow}>
                  <Text style={styles.sumLabel}>Starting Float:</Text>
                  <Text style={styles.sumVal}>${(activeCashSession?.openingFloat || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.sumRow}>
                  <Text style={styles.sumLabel}>+ Cash Sales:</Text>
                  <Text style={[styles.sumVal, { color: colors.success }]}>
                    +${(activeCashSession?.cashSalesAmount || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.sumRow}>
                  <Text style={styles.sumLabel}>- Cash Expenses:</Text>
                  <Text style={[styles.sumVal, { color: colors.danger }]}>
                    -${(activeCashSession?.expenseAmount || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.sumRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <Text style={styles.expectedLabel}>EXPECTED IN DRAWER:</Text>
                  <Text style={styles.expectedVal}>${(activeCashSession?.expectedCash || 0).toFixed(2)}</Text>
                </View>
              </View>

              <Text style={styles.label}>Physical Cash Counted in Drawer ($) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter exact counted cash..."
                placeholderTextColor={colors.textMuted}
                value={actualCount}
                onChangeText={setActualCount}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Shift Closing Notes</Text>
              <TextInput
                style={styles.input}
                placeholder="Discrepancy explanations / Notes"
                placeholderTextColor={colors.textMuted}
                value={closingNotes}
                onChangeText={setClosingNotes}
              />

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.warning }]} onPress={handleAction}>
                <Calculator size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitText}>Reconcile & Close Register</Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  subtext: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 14,
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
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sumLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  sumVal: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  expectedLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  expectedVal: {
    color: colors.primaryLight,
    fontSize: 16,
    fontWeight: '800',
  },
  submitBtn: {
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
