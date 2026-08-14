import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { Building2, ChevronDown, UserCheck } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onPressProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onPressProfile }) => {
  const { activeBusiness, activeBranch, role } = useAuthStore();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.businessBadge}>
          <Building2 size={16} color={colors.primaryLight} style={{ marginRight: 6 }} />
          <Text style={styles.businessName} numberOfLines={1}>
            {activeBusiness?.name || 'Apex Retail'}
          </Text>
          <Text style={styles.branchName}> • {activeBranch?.code || 'Main'}</Text>
        </View>

        <TouchableOpacity style={styles.roleBadge} onPress={onPressProfile}>
          <UserCheck size={14} color={colors.success} style={{ marginRight: 4 }} />
          <Text style={styles.roleText}>{role}</Text>
        </TouchableOpacity>
      </View>

      {title && (
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.titleText}>{title}</Text>
            {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.cardBg,
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  businessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  businessName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  branchName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  titleRow: {
    marginTop: 4,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
