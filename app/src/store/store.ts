import {configureStore} from '@reduxjs/toolkit';
import electricityReducer from './electricitySlice';

export const store = configureStore({
  reducer: {
    electricity: electricityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
