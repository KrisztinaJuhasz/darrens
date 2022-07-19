import { createAction, props } from '@ngrx/store';

export const finishLoading = createAction(
    '[Logo Render Component] Loading finished',
    props<{ payload: boolean }>()
);
