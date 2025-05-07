import React, { useEffect, useRef, useState } from 'react'
import MessageHeader from './MessageHeader';
import Message from './Message';
import MessageForm from './MessageForm';
import { useDispatch, useSelector } from 'react-redux';
import Skeleton from '../../../components/Skeleton';
import { ref, onChildAdded, onChildRemoved, child, off } from "firebase/database";
import { db } from '../../../firebase';
import { setUserPosts } from '../../../store/chatRoomSlice';

const MainPanel = () => {

    const messageEndRef = useRef(null);
    const messagesRef = ref(db, "messages")
    const typingRef = ref(db, "typing");

    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [listenerLists, setListenerLists] = useState([]);

    const { currentUser } = useSelector(state => state.user);
    const { currentChatRoom } = useSelector(state => state.chatRoom);
    const dispatch = useDispatch();

    useEffect(() => {
        if (currentChatRoom.id) {
            addMessagesListeners(currentChatRoom.id)
            addTypingListeners(currentChatRoom.id)
        }

        return () => {
            off(messagesRef);
            removeListeners(listenerLists);
        }
    }, [currentChatRoom.id])

    useEffect(() => {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    })

    const removeListeners = (listeners) => {
        listeners.forEach(listener => {
            off(ref(db, `messages/${listener.id}`), listener.event);
        })
    }

    const addTypingListeners = (chatRoomId) => {
        let typingUsers = [];

        //typing이 새로 들어올 때
        onChildAdded(child(typingRef, chatRoomId), DataSnapshot => {
            if (DataSnapshot.key !== currentUser.uid) {
                typingUsers = typingUsers.concat({
                    id: DataSnapshot.key,
                    name: DataSnapshot.val()
                });
                setTypingUsers(typingUsers)
            }
        })

        //listenersList state에 등록된 리스너를 넣어주기 
        addToListenerLists(chatRoomId, typingRef, "child_added")

        //typing을 지워줄 때
        onChildRemoved(child(typingRef, chatRoomId), DataSnapshot => {
            const index = typingUsers.findIndex(user => user.id === DataSnapshot.key);
            if (index !== -1) {
                typingUsers = typingUsers.filter(user => user.id !== DataSnapshot.key);
                setTypingUsers(typingUsers)
            }
        })

        //listenersList state에 등록된 리스너를 넣어주기 
        addToListenerLists(chatRoomId, typingRef, "child_removed")
    }

    const addToListenerLists = (id, ref, event) => {

        //이미 등록된 리스너인지 확인 
        const index = listenerLists.findIndex(listener => {
            return (
                listener.id === id &&
                listener.ref === ref &&
                listener.event === event
            );
        })

        if (index === -1) {
            const newListener = { id, ref, event }
            setListenerLists(listenerLists.concat(newListener))
        }
    }

    const handleSearchMessages = (searchTerm) => {
        const chatRoomMessages = [...messages];
        const regex = new RegExp(searchTerm, "gi");
        const searchResults = chatRoomMessages.reduce((acc, message) => {
            if (
                (message.content && message.content.match(regex)) ||
                message.user.name.match(regex)
            ) {
                acc.push(message)
            }
            return acc;
        }, [])
        setSearchResults(searchResults);
        setSearchLoading(false);
    }

    const handleSearchChange = event => {
        setSearchTerm(event.target.value);
        setSearchLoading(true);

        handleSearchMessages(event.target.value);
    }

    const addMessagesListeners = (chatRoomId) => {

        let messagesArray = [];
        setMessages([]); 
        // 대화가 없는 방에 들어갔을 때 아래 로직이 동작 안 해서 사용한 trick

        onChildAdded(child(messagesRef, chatRoomId), DataSnapshot => {
            messagesArray.push(DataSnapshot.val());
            const newMessageArray = [...messagesArray];
             // 이 부분 없으면 messages state 가 동일하게 [] 이여서 리렌더링 X

            setMessages(newMessageArray);
            setMessagesLoading(false);
            userPostsCount(newMessageArray);
        })
    }

    const userPostsCount = (messages) => {
        const userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) {
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                    image: message.user.image,
                    count: 1
                }
            }
            return acc;
        }, {})
        // console.log('userPosts :', userPosts);
        dispatch(setUserPosts(userPosts))
    }

    const renderMessages = (messages) =>
        messages.length > 0 &&
        messages.map((message) => (
            <Message
                key={message.timestamp}
                message={message}
                user={currentUser}
            />
        ))

    const renderTypingUsers = (typingUsers) =>
        typingUsers.length > 0 &&
        typingUsers.map(user => (
            <span key={user.name.userUid}>
                {user.name.userUid}님이 채팅을 입력하고 있습니다...
            </span>
        ))


    const renderMessageSkeleton = (loading) =>
        loading && (
            <>
                {[...Array(11)].map((v, i) => (
                    <Skeleton key={i} />
                ))}
            </>
        )

    return (
        <div style={{ padding: '2rem 2rem 0 2rem' }}>

            <MessageHeader handleSearchChange={handleSearchChange} />

            <div style={{
                width: '100%',
                height: '567px',
                border: '.2rem solid #ececec',
                borderRadius: '4px',
                padding: '1rem',
                marginBottom: '1rem',
                overflowY: 'auto'
            }}>
                {renderMessageSkeleton(messagesLoading)}

                {searchLoading && <div>Searching...</div>}

                {searchTerm ?
                    renderMessages(searchResults)
                    :
                    renderMessages(messages)
                }

                {renderTypingUsers(typingUsers)}
                <div ref={messageEndRef} />
            </div>

            <MessageForm />

        </div>
    )
}

export default MainPanel





