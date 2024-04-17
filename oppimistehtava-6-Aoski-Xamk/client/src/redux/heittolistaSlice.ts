import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export const haeHeitot = createAsyncThunk("heittolista/haeHeitot", async () => {

    const yhteys = await fetch("http://localhost:3001/api/heittolista");
    return await yhteys.json();
});

export const tallennaHeitot = createAsyncThunk("heittolista/tallennaHeitot", async (payload, {getState}) => {

    console.log(getState());

    const yhteys = await fetch("http://localhost:3001/api/heittolista", {
        method : "POST",
        headers  : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(getState())
    });
    return await yhteys.json();
});

export interface Heitto {
    id : string,
    nimi : string,
    ajankohta : string,
    kilpailijat : string[],
    kierrokset : number,
    pisteet : number[],
    suoritettu : boolean
  }

const heitot : Heitto[] = [];

export const heittolistaSlice = createSlice({
    name : "heittolista",
    initialState : { heitot : [...heitot] },
    reducers : {
        lisaaHeitto : (state, action: PayloadAction<Heitto>) => {
            state.heitot = [...state.heitot, action.payload];
        },
        vaihdaSuoritettu : (state, action: PayloadAction<string>) => {

            let vaihdettava : Heitto = {...state.heitot.find((heitto : Heitto) => heitto.id === action.payload)!};

            state.heitot.splice(state.heitot.findIndex((heitto : Heitto) => heitto.id === action.payload),
                                  1, 
                                  {...vaihdettava, suoritettu : !vaihdettava.suoritettu});

        },
        poistaHeitto : (state, action: PayloadAction<string>) => {

           state.heitot.splice(state.heitot.findIndex((heitto : Heitto) => heitto.id === action.payload), 1);

        }
    },
    extraReducers : (builder) => {
        builder.addCase(haeHeitot.fulfilled, (state, action) => {
            state.heitot = action.payload;
        }).addCase(tallennaHeitot.fulfilled, () => {
            console.log("Tallennettu!");
        });
    }
});

export const { lisaaHeitto, vaihdaSuoritettu, poistaHeitto } = heittolistaSlice.actions;

export default heittolistaSlice.reducer;