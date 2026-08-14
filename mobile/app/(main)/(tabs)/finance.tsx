import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Header } from '../../../src/components/common/Header';
import { ReceiptModal } from '../../../src/components/pos/ReceiptModal';
import { AddExpenseModal } from '../../../src/components/finance/AddExpenseModal';
import { CashRegisterModal } from '../../../src/components/finance/CashRegisterModal';
import { useBusinessDataStore } from '../../../src/store/useBusinessDataStore';
import { Sale } from '../../../src/types';
import { colors } from '../../../src/theme/colors';
import {
  DollarSign,
  Receipt,
  Plus,
  Lock,
  Unlock,
  CreditCard,
  Banknote,
  FileText,
  Eye,
} from 'lucide-react-native';

export default function FinanceScreen() {
  const { sales, expenses, activeCashSession } = useBusinessDataStore();
  const [activeTab, setActiveTab] = useState<'SALES' | 'EXPENSES' | 'REGISTER'>('SALES');

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerModalMode, setRegisterModalMode] = useState<'OPEN' | 'CLOSE'>('OPEN');
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  const totalExpenseSum = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <View style={styles.container}>
      <Header title="Finance & Cash Drawer" subtitle="Sales Ledger, Expenses & Shift Closing" />

      {/* Segmented Control Bar */}
      <View style={styles.segmentBar}>
        <TouchableOpacity
          style={[styles.segBtn, activeTab === 'SALES' && styles.segBtnActive]}
          onPress={() => setActiveTab('SALES')}
        >
          <FileText size={16} color={activeTab === 'SALES' ? colors.primaryLight : colors.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.segText, activeTab === 'SALES' && styles.segTextActive]}>
            Sales ({sales.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segBtn, activeTab === 'EXPENSES' && styles.segBtnActive]}
          onPress={() => setActiveTab('EXPENSES')}
        >
          <Receipt size={16} color={activeTab === 'EXPENSES' ? colors.danger : colors.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.segText, activeTab === 'EXPENSES' && styles.segTextActive]}>
            Expenses (${totalExpenseSum.toFixed(0)})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segBtn, activeTab === 'REGISTER' && styles.segBtnActive]}
          onPress={() => setActiveTab('REGISTER')}
        >
          <Banknote size={16} color={activeTab === 'REGISTER' ? colors.success : colors.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.segText, activeTab === 'REGISTER' && styles.segTextActive]}>
            Register Drawer
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: Sales Invoices History */}
      {activeTab === 'SALES' && (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.saleCard}
              onPress={() => setSelectedSaleForReceipt(item)}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.invNo}>{item.invoiceNumber}</Text>
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidBadgeText}>{item.paymentStatus}</Text>
                  </View>
                </View>
                <Text style={styles.saleMeta}>
                  Customer: {item.customerName} • Cashier: {item.cashierName}
                </Text>
                <Text style={styles.saleTime}>
                  {new Date(item.saleDate).toLocaleDateString()} {new Date(item.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.saleTotal}>${item.totalAmount.toFixed(2)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Eye size={14} color={colors.primaryLight} style={{ marginRight: 4 }} />
                  <Text style={styles.viewReceiptText}>View Receipt</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* TAB 2: Expense Management */}
      {activeTab === 'EXPENSES' && (
        <View style={{ flex: 1 }}>
          <View style={styles.expenseTopBar}>
            <Text style={styles.expenseSummaryText}>
              Total Outflow: <Text style={{ color: colors.danger, fontWeight: '800' }}>${totalExpenseSum.toFixed(2)}</Text>
            </Text>
            <TouchableOpacity style={styles.addExpenseBtn} onPress={() => setExpenseModalOpen(true)}>
              <Plus size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.addExpenseText}>Log Expense</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 10, padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.expenseCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseTitle}>{item.title}</Text>
                  <Text style={styles.expenseSub}>Category: {item.category} • Method: {item.paymentMethod}</Text>
                  <Text style={styles.expenseDate}>
                    {new Date(item.expenseDate).toLocaleDateString()} by {item.createdBy}
                  </Text>
                </View>

                <Text style={styles.expenseAmount}>-${item.amount.toFixed(2)}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* TAB 3: Cash Register Session */}
      {activeTab === 'REGISTER' && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <View style={styles.registerStatusCard}>
            <View style={styles.regHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Banknote size={22} color={colors.primaryLight} style={{ marginRight: 8 }} />
                <Text style={styles.regTitle}>Register Drawer Session</Text>
              </View>
              <Text
                style={[
                  styles.statusTag,
                  activeCashSession?.status === 'OPEN' ? { color: colors.success } : { color: colors.warning },
                ]}
              >
                ● {activeCashSession?.status || 'CLOSED'}
              </Text>
            </View>

            {activeCashSession && activeCashSession.status === 'OPEN' ? (
              <View style={{ marginTop: 12 }}>
                <View style={styles.sessionGrid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Opened By</Text>
                    <Text style={styles.gridVal}>{activeCashSession.openedBy}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Starting Float</Text>
                    <Text style={styles.gridVal}>${activeCashSession.openingFloat.toFixed(2)}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Cash Sales</Text>
                    <Text style={[styles.gridVal, { color: colors.success }]}>
                      +${activeCashSession.cashSalesAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Cash Expenses</Text>
                    <Text style={[styles.gridVal, { color: colors.danger }]}>
                      -${activeCashSession.expenseAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.expectedBox}>
                  <Text style={styles.expectedLabel}>EXPECTED CASH IN DRAWER:</Text>
                  <Text style={styles.expectedAmount}>${activeCashSession.expectedCash.toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.regActionBtn, { backgroundColor: colors.warning }]}
                  onPress={() => {
                    setRegisterModalMode('CLOSE');
                    setRegisterModalOpen(true);
                  }}
                >
                  <Lock size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.regActionText}>Close Register & Reconcile Shift</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <Unlock size={36} color={colors.textMuted} />
                <Text style={styles.noSessionTitle}>No Active Register Drawer</Text>
                <Text style={styles.noSessionSub}>
                  Open a new shift session to enable cash floating and daily register drawer tracking.
                </Text>

                <TouchableOpacity
                  style={[styles.regActionBtn, { backgroundColor: colors.success, marginTop: 16 }]}
                  onPress={() => {
                    setRegisterModalMode('OPEN');
                    setRegisterModalOpen(true);
                  }}
                >
                  <Unlock size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.regActionText}>Open Register Drawer Session</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Modals */}
      <AddExpenseModal visible={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} />
      <CashRegisterModal
        visible={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        mode={registerModalMode}
      />
      <ReceiptModal
        visible={!!selectedSaleForReceipt}
        sale={selectedSaleForReceipt}
        onClose={() => setSelectedSaleForReceipt(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  segBtn: {
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
  segBtnActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  segText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  segTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  saleCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  invNo: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  paidBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  paidBadgeText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  saleMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  saleTime: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  saleTotal: {
    color: colors.success,
    fontSize: 17,
    fontWeight: '800',
  },
  viewReceiptText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '600',
  },
  expenseTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  expenseSummaryText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  addExpenseBtn: {
    backgroundColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addExpenseText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  expenseCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  expenseSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  expenseDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  expenseAmount: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '800',
  },
  registerStatusCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  statusTag: {
    fontSize: 12,
    fontWeight: '800',
  },
  sessionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  gridItem: {
    backgroundColor: colors.background,
    width: '48%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  gridVal: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 2,
  },
  expectedBox: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 14,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  expectedLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  expectedAmount: {
    color: colors.success,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  regActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  regActionText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  noSessionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  noSessionSub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
});
