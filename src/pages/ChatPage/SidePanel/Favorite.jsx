import React, { useEffect, useState } from 'react'
import { FaRegSmileBeam } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { child, ref, onChildAdded, onChildRemoved, off } from "firebase/database";
import { db } from '../../../firebase';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../store/chatRoomSlice';

const Favorite = () => {
    const dispatch = useDispatch();

    const [favoriteChatRooms, setFavoriteChatRooms] = useState([]);
    const [activeChatRoomId, setActiveChatRoomId] = useState('');

    const userRef = ref(db, 'users');
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        if (currentUser?.uid) {
            addListeners(currentUser.uid)
        }

        return () => {
            if (currentUser?.uid) {
                removeListener(currentUser.uid);
            }
        }
    }, [currentUser?.uid])

    const removeListener = (userId) => {
        off(child(userRef, `${userId}/favorite`));
    }

    const addListeners = (userId) => {
        let favoriteArray = [];
        onChildAdded(child(userRef, `${userId}/favorite`), DataSnapshot => {
            favoriteArray.push({ id: DataSnapshot.key, ...DataSnapshot.val() })
            const newFavoriteChatRooms = [...favoriteArray];
            setFavoriteChatRooms(newFavoriteChatRooms)
        })

        onChildRemoved(child(userRef, `${userId}/favorite`), DataSnapshot => {
            const filteredChatRooms = favoriteArray.filter(chatRoom => {
                return chatRoom.id !== DataSnapshot.key;
            })
            favoriteArray = filteredChatRooms;
            setFavoriteChatRooms(filteredChatRooms)
        })
    }

    const changeChatRoom = (room) => {
        dispatch(setCurrentChatRoom(room));
        dispatch(setPrivateChatRoom(false));
        setActiveChatRoomId(room.id);
    }

    const renderFavoriteChatRooms = (favoriteChatRooms) =>
        favoriteChatRooms.length > 0 &&
        favoriteChatRooms.map(chatRoom => (
            <li
                key={chatRoom.id}
                onClick={() => changeChatRoom(chatRoom)}
                style={{
                    backgroundColor: chatRoom.id === activeChatRoomId && "#ffffff45"
                }}
            >
                # {chatRoom.name}
            </li>
        ))

    return (
        <div>
            <span style={{ display: 'flex', alignItems: 'center' }}>
                <FaRegSmileBeam style={{ marginRight: '3px' }} />
                FAVORITE ({favoriteChatRooms.length})
            </span>
            <ul style={{ listStyleType: 'none', padding: '0' }}>
                {renderFavoriteChatRooms(favoriteChatRooms)}
            </ul>
        </div>
    )
}

export default Favorite
