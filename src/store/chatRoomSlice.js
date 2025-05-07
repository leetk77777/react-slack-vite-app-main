import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentChatRoom: {
        createdBy: {
            image: '',
            name: ''
        },
        description: '',
        id: '',
        name: ''
    },
    isPrivateChatRoom: false,
    userPosts: null
}


export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setCurrentChatRoom: (state, action) => {
            state.currentChatRoom = action.payload;
        },
        setPrivateChatRoom: (state, action) => {
            state.isPrivateChatRoom = action.payload;
        },
        setUserPosts: (state, action) => {
            state.userPosts = action.payload;
        }
    }
})

export const { setCurrentChatRoom, setPrivateChatRoom, setUserPosts } = userSlice.actions;

export default userSlice.reducer;