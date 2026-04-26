import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Settings, SettingsState } from '../../types';
import { DEFAULT_SETTINGS } from '../../constants';

const initialState: SettingsState = {
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<Settings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetSettings: (state) => {
      state.settings = DEFAULT_SETTINGS;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  updateSettings,
  resetSettings,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;