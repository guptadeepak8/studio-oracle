import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeFilterType = "all" | "positive" | "friction";

interface DashboardState {
  selectedDropAId: string;
  selectedDropBId: string;
  themeFilter: ThemeFilterType;
  searchFilter: string;
  activePlatformTab: "both" | "youtube" | "reddit";
}

const initialState: DashboardState = {
  selectedDropAId: "",
  selectedDropBId: "",
  themeFilter: "all",
  searchFilter: "",
  activePlatformTab: "both",
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSelectedDropA: (state, action: PayloadAction<string>) => {
      state.selectedDropAId = action.payload;
    },
    setSelectedDropB: (state, action: PayloadAction<string>) => {
      state.selectedDropBId = action.payload;
    },
    setThemeFilter: (state, action: PayloadAction<ThemeFilterType>) => {
      state.themeFilter = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.searchFilter = action.payload;
    },
    setActivePlatformTab: (state, action: PayloadAction<"both" | "youtube" | "reddit">) => {
      state.activePlatformTab = action.payload;
    },
    resetDashboardFilters: (state) => {
      state.themeFilter = "all";
      state.searchFilter = "";
      state.activePlatformTab = "both";
    },
  },
});

export const {
  setSelectedDropA,
  setSelectedDropB,
  setThemeFilter,
  setSearchFilter,
  setActivePlatformTab,
  resetDashboardFilters,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

