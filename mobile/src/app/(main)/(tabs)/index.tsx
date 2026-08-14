import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../../../components/common/Header';
import { StatCard } from '../../../components/common/StatCard';
import { useBusinessDataStore } from '../../../store/useBusinessDataStore';
import { colors } from '../../../theme/colors';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  Package,
  Receipt,
  Bot,
  CreditCard,
  Banknote,
} from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { sales, products, activeCashSession } = useBusinessDataStore();

  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const totalCost = sales.reduce((sum, s) => {
    return sum + s.items.reduce((itemSum, item) => itemSum + item.costPrice * item.quantity, 0);
  }, 0);
  const grossProfit = Math.max(0, totalRevenue - totalCost);

  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minimumStock);

  return (
    <View style={styles.container}>
      <Header
        title="Business Dashboard"
        subtitle="Real-time Store Performance & Insights"
        onPressProfile={() => router.push('/settings' as any)}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {lowStockProducts.length > 0 && (
          <TouchableOpacity
            style={styles.warningBanner}
            onPress={() => router.push('/(main)/(tabs)/inventory' as any)}
          >
            <AlertTriangle size={20} color={colors.warning} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>
                {lowStockProducts.length} Product(s) Below Low Stock Threshold!
              </Text>
              <Text style={styles.warningSub}>
                {lowStockProducts.map((p) => `${p.name} (${p.stockQuantity} left)`).join(', ')}
              </Text>
            </View>
            <ArrowRight size={18} color={colors.warning} />
          </TouchableOpacity>
        )}

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Sales"
            value={`$${totalRevenue.toFixed(2)}`}
            change="+14.2%"
            trend="up"
            accentColor={colors.primary}
            icon={<DollarSign size={16} color={colors.primary} />}
          />
          <StatCard
            title="Gross Profit"
            value={`$${grossProfit.toFixed(2)}`}
            change="+8.5%"
            trend="up"
            accentColor={colors.success}
            icon={<TrendingUp size={16} color={colors.success} />}
          />
        </View>

        <View style={[styles.statsGrid, { marginTop: 10 }]}>
          <StatCard
            title="Total Transactions"
            value={`${totalSalesCount}`}
            change="+5 Orders"
            trend="up"
            accentColor={colors.accent}
            icon={<ShoppingCart size={16} color={colors.accent} />}
          />
          <StatCard
            title="Low Stock Items"
            value={`${lowStockProducts.length}`}
            change={lowStockProducts.length > 0 ? 'Requires Action' : 'Optimal'}
            trend={lowStockProducts.length > 0 ? 'down' : 'up'}
            accentColor={colors.warning}
            icon={<AlertTriangle size={16} color={colors.warning} />}
          />
        </View>

        <Text style={styles.sectionTitle}>QUICK OPERATIONS</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primaryBg, borderColor: colors.primary }]}
            onPress={() => router.push('/(main)/(tabs)/pos' as any)}
          >
            <ShoppingCart size={22} color={colors.primaryLight} />
            <Text style={[styles.actionText, { color: colors.primaryLight }]}>New POS Sale</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.successBg, borderColor: colors.success }]}
            onPress={() => router.push('/(main)/(tabs)/inventory' as any)}
          >
            <Package size={22} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}
            onPress={() => router.push('/(main)/(tabs)/finance' as any)}
          >
            <Receipt size={22} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.danger }]}>Log Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: 'rgba(6, 182, 212, 0.12)', borderColor: colors.accent }]}
            onPress={() => router.push('/(main)/(tabs)/ai' as any)}
          >
            <Bot size={22} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.accent }]}>AI Insights</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Cash Register Session</Text>
            <Text style={[styles.sessionStatus, { color: activeCashSession?.status === 'OPEN' ? colors.success : colors.warning }]}>
              ● {activeCashSession?.status || 'CLOSED'}
            </Text>
          </View>

          {activeCashSession && activeCashSession.status === 'OPEN' ? (
            <View style={styles.sessionDetails}>
              <View style={styles.sessionRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Banknote size={16} color={colors.success} style={{ marginRight: 6 }} />
                  <Text style={styles.sessionLabel}>Cash Sales:</Text>
                </View>
                <Text style={styles.sessionValue}>${activeCashSession.cashSalesAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.sessionRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CreditCard size={16} color={colors.card} style={{ marginRight: 6 }} />
                  <Text style={styles.sessionLabel}>Card Sales:</Text>
                </View>
                <Text style={styles.sessionValue}>${activeCashSession.cardSalesAmount.toFixed(2)}</Text>
              </View>
              <View style={[styles.sessionRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 13 }}>Expected Cash Drawer Float:</Text>
                <Text style={{ color: colors.success, fontWeight: '800', fontSize: 15 }}>
                  ${activeCashSession.expectedCash.toFixed(2)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 13, marginVertical: 6 }}>
              No register drawer is currently open. Open register drawer to process cash sales.
            </Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>RECENT SALES INVOICES</Text>
        <View style={{ gap: 8, marginBottom: 20 }}>
          {sales.slice(0, 4).map((sale) => (
            <View key={sale.id} style={styles.saleItemCard}>
              <View style={styles.saleLeft}>
                <Text style={styles.invoiceNo}>{sale.invoiceNumber}</Text>
                <Text style={styles.saleMeta}>
                  {sale.customerName} • {sale.items.length} item(s) • {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.saleRight}>
                <Text style={styles.saleAmount}>${sale.totalAmount.toFixed(2)}</Text>
                <View style={styles.payBadge}>
                  <Text style={styles.payBadgeText}>{sale.paymentMethod}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  warningBanner: {
    backgroundColor: colors.warningBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    color: colors.warning,
    fontWeight: '700',
    fontSize: 13,
  },
  warningSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  sessionStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  sessionDetails: {
    gap: 6,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  sessionValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  saleItemCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saleLeft: {
    flex: 1,
  },
  invoiceNo: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  saleMeta: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  saleRight: {
    alignItems: 'flex-end',
  },
  saleAmount: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '800',
  },
  payBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payBadgeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
});
