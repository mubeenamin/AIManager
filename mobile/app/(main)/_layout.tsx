import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { LayoutDashboard, ShoppingCart, Package, DollarSign, Bot } from 'lucide-react-native';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="(tabs)/index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/pos"
        options={{
          title: 'POS Terminal',
          tabBarIcon: ({ color, size }) => <ShoppingCart size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => <Package size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/finance"
        options={{
          title: 'Finance',
          tabBarIcon: ({ color, size }) => <DollarSign size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/ai"
        options={{
          title: 'AI Insights',
          tabBarIcon: ({ color, size }) => <Bot size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
