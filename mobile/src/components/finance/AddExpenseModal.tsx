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
import { PaymentMethod } from '../../types';
import { colors } from '../../theme/colors';
import { X, DollarSign, Receipt } from 'lucide-react-native';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ visible, onClose }) => {
  const { addExpense } = useBusinessDataStore();

  const [category, setCategory] = useState<'Rent' | 'Utilities' | 'Salaries' | 'Supplies' | 'Marketing' | 'Maintenance' | 'Other'>('Supplies');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!title || !amount || parseFloat(amount) <= 0) {
      Alert.alert('Required Fields', 'Please enter expense Title and Amount.');
      return;
    }

    addExpense({
      businessId: 'biz-1',
      branchId: 'branch-1',
      category,
      title,
      amount: parseFloat(amount),
      paymentMethod,
      notes,
      createdBy: 'Mubeen',
    });

    Alert.alert('Expense Recorded', `Logged $${parseFloat(amount).toFixed(2)} for "${title}".`);
    setTitle('');
    setAmount('');
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
              <Receipt size={20} color={colors.danger} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Record Expense Outflow</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Category Selector */}
          <Text style={styles.label}>Expense Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['Supplies', 'Utilities', 'Rent', 'Salaries', 'Marketing', 'Maintenance', 'Other'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, category === cat && styles.catPillActive]}
                  onPress={() => setCategory(cat as any)}
                >
                  <Text style={[styles.catPillText, category === cat && styles.catPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Title */}
          <Text style={styles.label}>Expense Title / Payee *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Thermal Paper Rolls / Internet Bill"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          {/* Amount */}
          <Text style={styles.label}>Amount ($) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          {/* Payment Method */}
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.paymentGrid}>
            {[
              { type: 'CASH', label: '💵 Cash Register' },
              { type: 'CARD', label: '💳 Bank Card' },
              { type: 'BANK_TRANSFER', label: '🏦 Bank Wire' },
            ].map((p) => (
              <TouchableOpacity
                key={p.type}
                style={[styles.payBtn, paymentMethod === p.type && styles.payBtnActive]}
                onPress={() => setPaymentMethod(p.type as PaymentMethod)}
              >
                <Text style={[styles.payText, paymentMethod === p.type && styles.payTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes */}
          <Text style={styles.label}>Optional Receipt Notes</Text>
          <TextInput
            style={styles.input}
            placeholder="Invoice / Voucher # reference"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <DollarSign size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.submitText}>Save Expense Voucher</Text>
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
  catPill: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catPillActive: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
  },
  catPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: colors.danger,
  },
  paymentGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  payBtn: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  payBtnActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  payText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  payTextActive: {
    color: colors.primaryLight,
  },
  submitBtn: {
    backgroundColor: colors.danger,
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
