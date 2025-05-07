import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: {
        uid: '',
        photoURL: '',
        displayName: ''
    }
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.currentUser.uid = action.payload.uid;
            state.currentUser.photoURL = action.payload.photoURL;
            state.currentUser.displayName = action.payload.displayName;
        },
        clearUser: (state) => {
            state.currentUser = {};
        },
        setPhotoUrl: (state, action) => {
            state.currentUser = {
                ...state.currentUser,
                photoURL: action.payload
            }
        }
    }
})

export const { setUser, clearUser, setPhotoUrl } = userSlice.actions;

export default userSlice.reducer;