import React, { useEffect, useState } from 'react'
import { FaRegSmileWink } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useDispatch, useSelector } from 'react-redux';
import { ref, onChildAdded, push, child, update, off } from "firebase/database";
import { db } from '../../../firebase';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../store/chatRoomSlice';

const ChatRooms = () => {

    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const chatRoomsRef = ref(db, "chatRooms");

    const [chatRooms, setChatRooms] = useState([]);
    const [firstLoad, setFirstLoad] = useState(true);
    const [activeChatRoomId, setActiveChatRoomId] = useState("");

    const { currentUser } = useSelector(state => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        AddChatRoomsListeners();
        return () => {
            off(chatRoomsRef);
        }
    }, [])

    const setFirstChatRoom = (chatRooms) => {
        const firstChatRoom = chatRooms[0];
        if (firstLoad && chatRooms.length > 0) {
            dispatch(setCurrentChatRoom(firstChatRoom));
            setActiveChatRoomId(firstChatRoom.id);
        }
        setFirstLoad(false);
    }

    const AddChatRoomsListeners = () => {
        let chatRoomsArray = [];

        onChildAdded(chatRoomsRef, DataSnapshot => {
            chatRoomsArray.push(DataSnapshot.val());
            const newChatRooms = [...chatRoomsArray];
            setChatRooms(newChatRooms);

            setFirstChatRoom(newChatRooms);
        })
    }

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isFormValid(name, description)) {
            addChatRoom();
        }
    }

    const addChatRoom = async () => {
        const key = push(chatRoomsRef).key;
        const newChatRoom = {
            id: key,
            name: name,
            description: description,
            createdBy: {
                name: currentUser.displayName,
                image: currentUser.photoURL
            }
        }

        try {
            await update(child(chatRoomsRef, key), newChatRoom)
            setName('');
            setDescription('');
            setShow(false);
        } catch (error) {
            alert(error)
        }
    }


    const isFormValid = (name, description) =>
        name && description;


    const changeChatRoom = (room) => {
        dispatch(setCurrentChatRoom(room));
        dispatch(setPrivateChatRoom(false));
        setActiveChatRoomId(room.id);
    }

    const renderChatRooms = (chatRooms) =>
        chatRooms.length > 0 &&
        chatRooms.map(room => (
            <li
                key={room.id}
                style={{
                    backgroundColor: room.id === activeChatRoomId && "#ffffff45"
                }}
                onClick={() => changeChatRoom(room)}
            >
                # {room.name}
            </li>
        ))

    return (
        <div>
            <div style={{
                position: 'relative', width: '100%',
                display: 'flex', alignItems: 'center'
            }}>

                <FaRegSmileWink style={{ marginRight: 3 }} />
                CHAT ROOMS {" "} ({chatRooms.length})

                <FaPlus
                    onClick={handleShow}
                    style={{
                        position: 'absolute',
                        right: 0, cursor: 'pointer'
                    }}
                />
            </div>

            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {renderChatRooms(chatRooms)}
            </ul>

            {/* ADD CHAT ROOM MODAL */}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>채팅 방 생성하기</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>방 이름</Form.Label>
                            <Form.Control
                                onChange={(e) => setName(e.target.value)}
                                type="text" placeholder="채팅 방 이름을 입력하세요." />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>방 설명</Form.Label>
                            <Form.Control
                                onChange={(e) => setDescription(e.target.value)}
                                type="text" placeholder="채팅 방 설명을 작성하세요." />
                        </Form.Group>
                    </Form>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        생성
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default ChatRooms

