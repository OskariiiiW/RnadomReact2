import { configureStore } from '@reduxjs/toolkit';
import heittolistaReducer from './heittolistaSlice'; 

export const store = configureStore({
    reducer : {
        heittolista : heittolistaReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;