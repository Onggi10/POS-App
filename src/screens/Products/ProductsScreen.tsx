import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addProductAsync, updateProductAsync, deleteProductAsync, fetchProducts, fetchCategories } from '../../store/slices/productSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, IMAGE_BASE_PATH } from '../../constants';
import { uploadApi } from '../../services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import * as ImagePicker from 'expo-image-picker';

export default function ProductsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, categories, isLoading, error } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '',
    image: '',
    imageUri: '',
  });

  // Fetch data saat component mount
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch({ type: 'products/clearError' }); // Clear error after showing
    }
  }, [error, dispatch]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilenameFromUri = (uri: string) => {
    const cleaned = uri.split('/').pop() || '';
    return cleaned.replace('file://', '');
  };

  const getImageUri = (filename: string) => {
    if (!filename) return '';
    if (filename.startsWith('http') || filename.startsWith('file://')) {
      return filename;
    }
    return `${IMAGE_BASE_PATH}/${filename}`;
  };

  const getMimeType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'webp': return 'image/webp';
      default: return 'image/jpeg';
    }
  };

  const uploadImageIfNeeded = async (uri: string, filename: string) => {
    if (!uri || !filename) return filename;
    const isLocalFile = uri.startsWith('file://') || uri.startsWith('content://');
    if (!isLocalFile) {
      return filename;
    }

    const uploadForm = new FormData();
    uploadForm.append('image', {
      uri,
      name: filename,
      type: getMimeType(filename),
    } as any);

    const response = await uploadApi.image(uploadForm);
    return response.data?.filename || filename;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      categoryId: '',
      price: '',
      costPrice: '',
      stock: '',
      minStock: '',
      image: '',
      imageUri: '',
    });
    setEditingProduct(null);
  };

  // Image picker functions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permissions needed', 'Camera and media library permissions are required to select images.');
        return false;
      }
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFormData(prev => ({
        ...prev,
        image: getFilenameFromUri(uri),
        imageUri: uri,
      }));
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFormData(prev => ({
        ...prev,
        image: getFilenameFromUri(uri),
        imageUri: uri,
      }));
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Pilih Gambar',
      'Pilih sumber gambar',
      [
        { text: 'Kamera', onPress: takePhoto },
        { text: 'Galeri', onPress: pickImageFromGallery },
        { text: 'Batal', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sku || !formData.categoryId || !formData.price) {
      Alert.alert('Error', 'Mohon lengkapi semua field yang diperlukan');
      return;
    }

    if (isLoading) {
      return; // Prevent multiple submissions
    }

    // Check if SKU already exists (case insensitive)
    const existingProduct = products.find(p =>
      p.sku.toLowerCase() === formData.sku.toLowerCase() &&
      (!editingProduct || p.id !== editingProduct.id)
    );

    if (existingProduct) {
      Alert.alert('Error', `SKU "${formData.sku}" sudah digunakan oleh produk "${existingProduct.name}". Mohon gunakan SKU yang berbeda.`);
      return;
    }

    let imageFilename = formData.image || '';
    try {
      imageFilename = await uploadImageIfNeeded(formData.imageUri, formData.image);
    } catch (uploadError) {
      Alert.alert('Error', 'Gagal mengunggah gambar produk. Coba lagi.');
      return;
    }

    const productData = {
      name: formData.name,
      sku: formData.sku,
      category_id: parseInt(formData.categoryId),
      price: parseFloat(formData.price),
      cost_price: formData.costPrice ? parseFloat(formData.costPrice) : null,
      stock: parseInt(formData.stock) || 0,
      min_stock: parseInt(formData.minStock) || 5,
      image: imageFilename,
      is_active: true,
    };

    if (editingProduct) {
      dispatch(updateProductAsync({ id: editingProduct.id, data: productData })).then(() => {
        // Refresh data after successful update
        dispatch(fetchProducts());
        dispatch(fetchCategories());
      });
    } else {
      dispatch(addProductAsync(productData)).then(() => {
        // Refresh data after successful add
        dispatch(fetchProducts());
        dispatch(fetchCategories());
      });
    }

    // Close modal immediately, error will be shown via useEffect if any
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const filename = product.image ? getFilenameFromUri(product.image) : '';
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      price: product.price.toString(),
      costPrice: product.costPrice?.toString() || '',
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      image: filename,
      imageUri: product.image ? getImageUri(product.image) : '',
    });
    setShowAddModal(true);
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Hapus Produk',
      `Apakah Anda yakin ingin menghapus "${product.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => dispatch(deleteProductAsync(product.id)).then(() => {
            // Refresh data after successful delete
            dispatch(fetchProducts());
            dispatch(fetchCategories());
          }),
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const category = categories.find(c => c.id === item.categoryId);

    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productSku}>SKU: {item.sku}</Text>
            <Text style={styles.productCategory}>{category?.name}</Text>
          </View>
          <View style={styles.productActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="pencil" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.productDetails}>
          {item.image ? (
            <Image source={{ uri: getImageUri(item.image) }} style={styles.productImage} />
          ) : null}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Harga:</Text>
            <Text style={styles.detailValue}>
              Rp {item.price.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stok:</Text>
            <Text style={[
              styles.detailValue,
              item.stock <= item.minStock && styles.lowStock
            ]}>
              {item.stock}
            </Text>
          </View>
          {item.costPrice && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Harga Modal:</Text>
              <Text style={styles.detailValue}>
                Rp {item.costPrice.toLocaleString('id-ID')}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ right: 1 }}
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Produk *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Masukkan nama produk"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SKU *</Text>
              <TextInput
                style={styles.input}
                value={formData.sku}
                onChangeText={(text) => setFormData({...formData, sku: text})}
                placeholder="Masukkan SKU"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kategori *</Text>
              <View style={styles.pickerContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      formData.categoryId === category.id && styles.categorySelected,
                    ]}
                    onPress={() => setFormData({...formData, categoryId: category.id})}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      formData.categoryId === category.id && styles.categorySelectedText,
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Harga Jual *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData({...formData, price: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Harga Modal</Text>
                <TextInput
                  style={styles.input}
                  value={formData.costPrice}
                  onChangeText={(text) => setFormData({...formData, costPrice: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Stok</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock}
                  onChangeText={(text) => setFormData({...formData, stock: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Stok Minimum</Text>
                <TextInput
                  style={styles.input}
                  value={formData.minStock}
                  onChangeText={(text) => setFormData({...formData, minStock: text})}
                  placeholder="5"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gambar Produk</Text>
              <TouchableOpacity
                style={styles.imagePickerContainer}
                onPress={showImagePickerOptions}
              >
                {formData.imageUri || formData.image ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: formData.imageUri || getImageUri(formData.image) }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setFormData(prev => ({ ...prev, image: '', imageUri: '' }))}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={48} color={COLORS.gray[400]} />
                    <Text style={styles.imagePlaceholderText}>Tap untuk pilih gambar</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.saveButtonText}>Menyimpan...</Text>
              ) : (
                <Text style={styles.saveButtonText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pos.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    gap: SPACING.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  productsList: {
    padding: SPACING.md,
  },
  productCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.pos.text,
    marginBottom: SPACING.xs,
  },
  productSku: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  editButton: {
    padding: SPACING.sm,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  productDetails: {
    gap: SPACING.sm,
  },
  productImage: {
    width: '100%',
    height: 160,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.gray[100],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.pos.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pos.text,
  },
  lowStock: {
    color: COLORS.danger,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? SPACING.xl + 6 : SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 82,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.pos.text,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pos.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: COLORS.gray[50],
  },
  inputRow: {
    flexDirection: 'row',
  },
  modalScrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryOption: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  categorySelected: {
    backgroundColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    color: COLORS.pos.text,
  },
  categorySelectedText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.pos.text,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Image picker styles
  imagePickerContainer: {
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.gray[500],
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
});