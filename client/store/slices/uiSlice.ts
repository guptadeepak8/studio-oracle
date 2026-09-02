import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isCreateModalOpen: boolean;
  isSidebarCollapsed: boolean;
}

const initialState: UIState = {
  isCreateModalOpen: false,
  isSidebarCollapsed: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCreateModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateModalOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
  },
});

export const { setCreateModalOpen, toggleSidebar, setSidebarCollapsed } = uiSlice.actions;
export default uiSlice.reducer;
