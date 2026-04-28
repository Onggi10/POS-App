import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { formatIDR } from '../../utils/currencyUtils';
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions } = useSelector((state: RootState) => state.transactions);
  const { products } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Calculate reports based on selected period
  const getFilteredTransactions = () => {
    const now = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    return transactions.filter(t => {
      const createdAt = new Date(t.createdAt);
      return createdAt >= startDate && t.status === 'completed';
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = filteredTransactions.length;
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Top products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      const existing = productSales.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productSales.set(item.productId, {
          name: item.product.name,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Payment methods
  const paymentMethods = filteredTransactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reportCards = [
    {
      title: 'Total Penjualan',
      value: formatIDR(totalSales),
      icon: 'cash-outline',
      color: COLORS.success,
    },
    {
      title: 'Jumlah Transaksi',
      value: totalTransactions.toString(),
      icon: 'receipt-outline',
      color: COLORS.primary,
    },
    {
      title: 'Rata-rata Transaksi',
      value: formatIDR(averageTransaction),
      icon: 'calculator-outline',
      color: COLORS.warning,
    },
    {
      title: 'Produk Terjual',
      value: topProducts.reduce((sum, p) => sum + p.quantity, 0).toString(),
      icon: 'cube-outline',
      color: COLORS.info,
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      scrollIndicatorInsets={{ right: 1 }}
    >
      <View style={styles.periodSelector}>
        {[
          { key: 'today', label: 'Hari Ini' },
          { key: 'week', label: '7 Hari' },
          { key: 'month', label: '30 Hari' },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodSelected,
            ]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period.key && styles.periodTextSelected,
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Report Cards */}
      <View style={styles.reportCards}>
        {reportCards.map((card, index) => (
          <View key={index} style={styles.reportCard}>
            <View style={[styles.cardIcon, { backgroundColor: card.color + '20' }]}>
              <Ionicons name={card.icon as any} size={24} color={card.color} />
            </View>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </View>
        ))}
      </View>

      {/* Top Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Produk Terlaris</Text>
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <View key={index} style={styles.productRow}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productStats}>
                  {product.quantity} terjual • {formatIDR(product.revenue)}
                </Text>
              </View>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Belum ada data penjualan</Text>
        )}
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
        {Object.entries(paymentMethods).map(([method, count]) => (
          <View key={method} style={styles.paymentRow}>
            <Text style={styles.paymentMethod}>
              {method === 'cash' ? 'Tunai' :
               method === 'qris' ? 'QRIS' :
               method === 'ewallet' ? 'E-Wallet' : 'Kartu'}
            </Text>
            <Text style={styles.paymentCount}>{count}x</Text>
          </View>
        ))}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
        {filteredTransactions.slice(0, 10).map((transaction) => (
          <View key={transaction.id} style={styles.transactionRow}>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionNumber}>
                {transaction.transactionNumber}
              </Text>
              <Text style={styles.transactionTime}>
                {transaction.createdAt.toLocaleString('id-ID')}
              </Text>
            </View>
            <Text style={styles.transactionAmount}>
              {formatIDR(transaction.total)}
            </Text>
          </View>
        ))}
        {filteredTransactions.length === 0 && (
          <Text style={styles.emptyText}>Belum ada transaksi</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pos.background,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
    ...SHADOWS.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  periodSelected: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: 14,
    color: COLORS.pos.text,
  },
  periodTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  reportCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  reportCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.pos.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 12,
    color: COLORS.pos.textSecondary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.pos.text,
    marginBottom: SPACING.lg,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pos.text,
  },
  productStats: {
    fontSize: 12,
    color: COLORS.pos.textSecondary,
    marginTop: SPACING.xs,
  },
  rankBadge: {
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  paymentMethod: {
    fontSize: 14,
    color: COLORS.pos.text,
  },
  paymentCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pos.text,
  },
  transactionTime: {
    fontSize: 12,
    color: COLORS.pos.textSecondary,
    marginTop: SPACING.xs,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
});