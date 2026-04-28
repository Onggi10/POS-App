import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateSettings } from '../../store/slices/settingsSlice';
import { logout } from '../../store/slices/authSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { Settings } from '../../types';

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSelector((state: RootState) => state.settings);
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<Settings>(settings);

  const handleSave = () => {
    dispatch(updateSettings(formData));
    Alert.alert('Sukses', 'Pengaturan berhasil disimpan');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const settingSections = [
    {
      title: 'Informasi Toko',
      items: [
        {
          key: 'storeName',
          label: 'Nama Toko',
          value: formData.storeName,
          placeholder: 'Masukkan nama toko',
        },
        {
          key: 'storeAddress',
          label: 'Alamat Toko',
          value: formData.storeAddress || '',
          placeholder: 'Masukkan alamat toko',
        },
        {
          key: 'storePhone',
          label: 'Telepon Toko',
          value: formData.storePhone || '',
          placeholder: 'Masukkan nomor telepon',
          keyboardType: 'phone-pad',
        },
      ],
    },
    {
      title: 'Pengaturan Bisnis',
      items: [
        {
          key: 'taxRate',
          label: 'Pajak (%)',
          value: formData.taxRate.toString(),
          placeholder: '0',
          keyboardType: 'numeric',
        },
        {
          key: 'currency',
          label: 'Mata Uang',
          value: formData.currency,
          placeholder: 'IDR',
        },
        {
          key: 'lowStockThreshold',
          label: 'Batas Stok Rendah',
          value: formData.lowStockThreshold.toString(),
          placeholder: '10',
          keyboardType: 'numeric',
        },
      ],
    },
    {
      title: 'Struk & Footer',
      items: [
        {
          key: 'receiptFooter',
          label: 'Footer Struk',
          value: formData.receiptFooter || '',
          placeholder: 'Terima kasih atas kunjungannya',
          multiline: true,
        },
      ],
    },
  ];

  const toggleOptions = [
    {
      key: 'enableTax',
      label: 'Aktifkan Pajak',
      value: formData.enableTax,
    },
    {
      key: 'enableDiscount',
      label: 'Aktifkan Diskon',
      value: formData.enableDiscount,
    },
    {
      key: 'enableCustomerManagement',
      label: 'Aktifkan Manajemen Pelanggan',
      value: formData.enableCustomerManagement,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={32} color={COLORS.primary} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'admin' ? 'Administrator' : 'Kasir'}
          </Text>
        </View>
      </View>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <View key={item.key} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{item.label}</Text>
              <TextInput
                style={[styles.input, (item as any).multiline && styles.multilineInput]}
                value={item.value}
                onChangeText={(text) => setFormData({...formData, [item.key]: text})}
                placeholder={item.placeholder}
                keyboardType={(item as any).keyboardType || 'default'}
                multiline={(item as any).multiline}
                numberOfLines={(item as any).multiline ? 3 : 1}
              />
            </View>
          ))}
        </View>
      ))}

      {/* Toggle Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitur</Text>
        {toggleOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={styles.toggleRow}
            onPress={() => setFormData({...formData, [option.key]: !option.value})}
          >
            <Text style={styles.toggleLabel}>{option.label}</Text>
            <View style={[
              styles.toggleSwitch,
              option.value && styles.toggleSwitchActive,
            ]}>
              <View style={[
                styles.toggleKnob,
                option.value && styles.toggleKnobActive,
              ]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Ionicons name="save" size={20} color={COLORS.white} />
          <Text style={styles.saveButtonText}>Simpan Pengaturan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color={COLORS.danger} />
          <Text style={styles.logoutButtonText}>Keluar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pos.background,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.pos.text,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.pos.textSecondary,
    marginTop: SPACING.xs,
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
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  toggleLabel: {
    fontSize: 16,
    color: COLORS.pos.text,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.gray[300],
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  actionsSection: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  logoutButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger,
    ...SHADOWS.sm,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});