import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend = 'up',
  icon,
  accentColor = colors.primary,
}) => {
  const isUp = trend === 'up';
  const trendColor = isUp ? colors.success : trend === 'down' ? colors.danger : colors.textMuted;

  return (
    <View style={[styles.card, { borderTopColor: accentColor, borderTopWidth: 3 }]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {icon && <View style={[styles.iconWrapper, { backgroundColor: accentColor + '20' }]}>{icon}</View>}
      </View>
      <Text style={styles.value}>{value}</Text>
      {change && (
        <View style={styles.trendRow}>
          <Text style={[styles.trendText, { color: trendColor }]}>
            {isUp ? '↑ ' : trend === 'down' ? '↓ ' : ''}
            {change}
          </Text>
          <Text style={styles.subtext}> vs previous period</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    minWidth: 150,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
