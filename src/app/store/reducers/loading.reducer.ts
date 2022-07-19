import { createReducer, on } from '@ngrx/store';
import * as LoadingActions from '../actions/loading.action';

const initialState: boolean = false;

export const loadingReducer = createReducer(
    initialState,
    on(LoadingActions.finishLoading, (_state: boolean, { payload }) => payload)
);
