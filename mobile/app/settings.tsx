import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { Branch } from '../src/types';
import { colors } from '../src/theme/colors';
import {
  Building2,
  MapPin,
  ShieldCheck,
  User,
  LogOut,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, activeBusiness, activeBranch, role, logout, setActiveBranch } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Settings & Profile</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* User Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatar}>
              <User size={24} color={colors.primaryLight} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{role}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Business Tenant Info */}
        <Text style={styles.sectionHeader}>CURRENT TENANT BUSINESS</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Building2 size={18} color={colors.primaryLight} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Business Legal Name</Text>
              <Text style={styles.infoVal}>{activeBusiness?.name}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tax Identification Number:</Text>
            <Text style={styles.infoVal}>{activeBusiness?.taxNumber || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Base Currency:</Text>
            <Text style={styles.infoVal}>{activeBusiness?.currency} ($)</Text>
          </View>
        </View>

        {/* Branch Switcher */}
        <Text style={styles.sectionHeader}>SELECT ACTIVE BRANCH</Text>
        <View style={{ gap: 8 }}>
          {activeBusiness?.branches.map((b: Branch) => (
            <TouchableOpacity
              key={b.id}
              style={[
                styles.branchCard,
                activeBranch?.id === b.id && styles.branchCardActive,
              ]}
              onPress={() => setActiveBranch(b)}
            >
              <MapPin size={18} color={activeBranch?.id === b.id ? colors.primaryLight : colors.textMuted} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.branchName}>{b.name}</Text>
                <Text style={styles.branchSub}>{b.address}</Text>
              </View>
              {activeBranch?.id === b.id && (
                <View style={styles.activeCheck}>
                  <Text style={styles.activeCheckText}>ACTIVE</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Role Permissions Inspector */}
        <Text style={styles.sectionHeader}>ROLE PERMISSIONS</Text>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <ShieldCheck size={18} color={colors.success} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Active Access Rights ({role})</Text>
          </View>
          <View style={styles.permGrid}>
            {[
              'sales.create',
              'sales.refund',
              'inventory.adjust',
              'products.edit',
              'reports.view',
              'expenses.create',
            ].map((p: string) => (
              <View key={p} style={styles.permChip}>
                <Text style={styles.permText}>✓ {p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out from Store</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  sectionHeader: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: colors.successBg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  roleTagText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  infoVal: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  branchCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  branchName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  branchSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  activeCheck: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeCheckText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  permGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  permChip: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
    marginBottom: 30,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '800',
    fontSize: 14,
  },
});
