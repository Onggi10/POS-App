import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addToCart, updateQuantity, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import { createTransaction } from '../../store/slices/transactionSlice';
import { fetchProducts, fetchCategories } from '../../store/slices/productSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, IMAGE_BASE_PATH } from '../../constants';
import { formatIDR } from '../../utils/currencyUtils';
import { Ionicons } from '@expo/vector-icons';
import { Product, CartItem, PaymentMethod } from '../../types';

const getProductImageUri = (image: string) => {
  if (!image) return '';
  if (image.startsWith('http') || image.startsWith('file://')) {
    return image;
  }
  return `${IMAGE_BASE_PATH}/${image}`;
};

export default function POSScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, categories } = useSelector((state: RootState) => state.products);
  const { items: cartItems, total, subtotal, tax, discount } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && product.isActive;
  });

  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      product,
      quantity: 1,
      price: product.price,
    };
    dispatch(addToCart(cartItem));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(updateQuantity({ itemId, quantity }));
    }
  };

  const handlePayment = () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Keranjang kosong');
      return;
    }

    const amount = parseFloat(paymentAmount) || 0;
    if (amount < total) {
      Alert.alert('Error', 'Jumlah pembayaran kurang');
      return;
    }

    dispatch(createTransaction({
      items: cartItems,
      paymentMethod,
      paymentAmount: amount,
      cashierId: user?.id || '',
      tax,
      discount,
    })).then(() => {
      dispatch(clearCart());
      setShowPayment(false);
      setPaymentAmount('');
      Alert.alert('Sukses', 'Transaksi berhasil!');
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleAddToCart(item)}
      disabled={item.stock <= 0}
    >
      <View style={styles.productImageContainer}>
        {item.image ? (
          <Image source={{ uri: getProductImageUri(item.image) }} style={styles.productImage} />
        ) : (
          <Ionicons name="cube-outline" size={32} color={COLORS.gray[400]} />
        )}
      </View>
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>
        {formatIDR(item.price)}
      </Text>
      <Text style={[
        styles.productStock,
        item.stock <= item.minStock && styles.lowStock
      ]}>
        Stok: {item.stock}
      </Text>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.product.name}</Text>
        <Text style={styles.cartItemPrice}>
          {formatIDR(item.price)}
        </Text>
      </View>
      <View style={styles.cartItemControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => dispatch(removeFromCart(item.id))}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (showPayment) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.paymentContainer}>
          <View style={styles.paymentHeader}>
            <TouchableOpacity
              onPress={() => setShowPayment(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.paymentTitle}>Pembayaran</Text>
          </View>

          <ScrollView
            style={styles.paymentContent}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + SPACING.xl }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.paymentSummary}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryValue}>
                {formatIDR(total)}
              </Text>
            </View>

            <View style={styles.paymentMethods}>
              {Object.entries({
                cash: 'Tunai',
                qris: 'QRIS',
                ewallet: 'E-Wallet',
                card: 'Kartu',
              }).map(([method, label]) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethod,
                    paymentMethod === method && styles.paymentMethodSelected,
                  ]}
                  onPress={() => setPaymentMethod(method as PaymentMethod)}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === method && styles.paymentMethodTextSelected,
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.paymentInput}
              placeholder="Jumlah bayar"
              keyboardType="numeric"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
            />

            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayment}
            >
              <Text style={styles.payButtonText}>Bayar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, !selectedCategory && styles.categorySelected]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextSelected]}>
            Semua
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryButton, selectedCategory === category.id && styles.categorySelected]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextSelected]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsGrid}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ right: 1 }}
      />

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Keranjang ({cartItems.length})</Text>
            <TouchableOpacity onPress={() => dispatch(clearCart())}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            style={styles.cartItems}
            showsVerticalScrollIndicator={false}
            scrollIndicatorInsets={{ right: 1 }}
          />

          <View style={styles.cartFooter}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {formatIDR(total)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => setShowPayment(true)}
            >
              <Text style={styles.checkoutButtonText}>Bayar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pos.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  categoryButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  categorySelected: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.pos.text,
  },
  categoryTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  productsGrid: {
    padding: SPACING.md,
  },
  productCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    margin: SPACING.xs,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  productImageContainer: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pos.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  productStock: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  lowStock: {
    color: COLORS.danger,
  },
  cartSummary: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    ...SHADOWS.lg,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.pos.text,
  },
  cartItems: {
    maxHeight: 200,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.pos.text,
  },
  cartItemPrice: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.pos.text,
    marginHorizontal: SPACING.md,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: SPACING.md,
  },
  cartFooter: {
    padding: SPACING.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.pos.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  paymentContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  backButton: {
    marginRight: SPACING.lg,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  paymentContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
  },
  paymentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.pos.text,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentMethods: {
    marginBottom: SPACING.xl,
  },
  paymentMethod: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  paymentMethodSelected: {
    backgroundColor: COLORS.primary,
  },
  paymentMethodText: {
    fontSize: 16,
    color: COLORS.pos.text,
  },
  paymentMethodTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  paymentInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  payButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
});