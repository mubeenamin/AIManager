import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Header } from '../../../src/components/common/Header';
import { useBusinessDataStore } from '../../../src/store/useBusinessDataStore';
import { colors } from '../../../src/theme/colors';
import { Bot, Send, Sparkles, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react-native';

export default function AIScreen() {
  const { aiChatMessages, sendAIMessage } = useBusinessDataStore();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = (prompt?: string) => {
    const textToSend = prompt || inputText;
    if (!textToSend.trim()) return;

    sendAIMessage(textToSend);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      <Header title="AI Business Assistant" subtitle="Intelligent Insights & Analytics Assistant" />

      {/* Recommended Prompt Chips */}
      <View style={styles.promptBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
            {[
              '🔥 Top 3 selling items today?',
              '⚠️ Low stock inventory alert?',
              '📊 Weekly profit margin summary?',
              '🔮 Sales prediction next 7 days',
            ].map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.promptChip}
                onPress={() => handleSend(chip)}
              >
                <Sparkles size={14} color={colors.primaryLight} style={{ marginRight: 4 }} />
                <Text style={styles.promptChipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Chat Messages Body */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatBody}
        contentContainerStyle={{ gap: 14, padding: 16 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {aiChatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {!isUser && (
                <View style={styles.botIconWrapper}>
                  <Bot size={16} color={colors.primaryLight} />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                  {msg.text}
                </Text>

                {/* Metrics Cards inside response */}
                {msg.metricsData && (
                  <View style={styles.metricsContainer}>
                    {msg.metricsData.map((m, idx) => (
                      <View key={idx} style={styles.metricCard}>
                        <Text style={styles.metricLabel}>{m.label}</Text>
                        <Text style={styles.metricVal}>{m.value}</Text>
                        {m.change && (
                          <Text
                            style={[
                              styles.metricChange,
                              m.trend === 'down' ? { color: colors.warning } : { color: colors.success },
                            ]}
                          >
                            {m.change}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Dynamic Chart Bar Representation inside response */}
                {msg.chartData && (
                  <View style={styles.chartBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <BarChart3 size={16} color={colors.primaryLight} style={{ marginRight: 6 }} />
                      <Text style={styles.chartTitle}>{msg.chartData.title}</Text>
                    </View>
                    {msg.chartData.labels.map((lbl, idx) => {
                      const maxVal = Math.max(...msg.chartData!.values);
                      const pct = Math.round((msg.chartData!.values[idx] / maxVal) * 100);
                      return (
                        <View key={idx} style={{ marginBottom: 6 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.barLabel}>{lbl}</Text>
                            <Text style={styles.barVal}>${msg.chartData!.values[idx].toFixed(2)}</Text>
                          </View>
                          <View style={styles.barBg}>
                            <View style={[styles.barFill, { width: `${pct}%` }]} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                <Text style={styles.msgTime}>{msg.timestamp}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Ask AI about sales, inventory, or expenses..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
          <Send size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  promptBar: {
    paddingVertical: 10,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chatBody: {
    flex: 1,
  },
  messageBubble: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    maxWidth: '90%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  botIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFF',
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  metricCard: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricVal: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  metricChange: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  chartBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
  },
  chartTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  barLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  barVal: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  barBg: {
    height: 6,
    backgroundColor: colors.cardBg,
    borderRadius: 3,
    marginTop: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 3,
  },
  msgTime: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
