import { AppState } from 'src/app/interfaces/app-state.interface';

export const loadingStore = (state: AppState): boolean => state.loading;
