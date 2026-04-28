import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchTransactions } from "../../store/slices/transactionSlice";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants";
import { formatIDR } from "../../utils/currencyUtils";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { transactions } = useSelector(
    (state: RootState) => state.transactions,
  );
  const { products } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  // Calculate today's stats
  const today = new Date();
  const todayTransactions = transactions.filter((t) => {
    const createdAt = new Date(t.createdAt); // convert dulu
    return (
      createdAt.toDateString() === today.toDateString() &&
      t.status === "completed"
    );
  });

  const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const stats = [
    {
      title: "Penjualan Hari Ini",
      value: formatIDR(todaySales),
      icon: "cash-outline",
      color: COLORS.success,
    },
    {
      title: "Transaksi Hari Ini",
      value: todayTransactions.length.toString(),
      icon: "receipt-outline",
      color: COLORS.primary,
    },
    {
      title: "Produk Stok Rendah",
      value: lowStockProducts.length.toString(),
      icon: "warning-outline",
      color: COLORS.danger,
    },
    {
      title: "Total Produk",
      value: products.length.toString(),
      icon: "cube-outline",
      color: COLORS.info,
    },
  ];

  return (
    <ScrollView style={styles.container} scrollIndicatorInsets={{ right: 1 }}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Selamat datang,</Text>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.date}>
          {today.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: stat.color + "20" },
              ]}
            >
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="cash" size={32} color={COLORS.primary} />
            <Text style={styles.actionText}>POS Baru</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="add-circle" size={32} color={COLORS.success} />
            <Text style={styles.actionText}>Tambah Produk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="bar-chart" size={32} color={COLORS.warning} />
            <Text style={styles.actionText}>Laporan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="settings" size={32} color={COLORS.gray[600]} />
            <Text style={styles.actionText}>Pengaturan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {lowStockProducts.length > 0 && (
        <View style={styles.alertSection}>
          <Text style={styles.sectionTitle}>Peringatan Stok</Text>
          {lowStockProducts.slice(0, 3).map((product) => (
            <View key={product.id} style={styles.alertCard}>
              <Ionicons name="warning" size={20} color={COLORS.danger} />
              <Text style={styles.alertText}>
                {product.name} - Stok: {product.stock}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pos.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.gray[600],
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.pos.text,
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: 14,
    color: COLORS.gray[500],
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.pos.text,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.pos.textSecondary,
    textAlign: "center",
  },
  quickActions: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.pos.text,
    marginBottom: SPACING.lg,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  actionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.pos.textSecondary,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  alertSection: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.danger + "10",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  alertText: {
    fontSize: 14,
    color: COLORS.danger,
    marginLeft: SPACING.sm,
    flex: 1,
  },
});
