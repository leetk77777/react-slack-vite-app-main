import React, { useState, useEffect } from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Image from 'react-bootstrap/Image';
import Accordion from 'react-bootstrap/Accordion';
import { FaLock } from 'react-icons/fa';
import { FaLockOpen } from 'react-icons/fa';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { AiOutlineSearch } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { ref, onValue, remove, child, update } from "firebase/database";
import { db } from '../../../firebase';


function MessageHeader({ handleSearchChange }) {
    const { currentChatRoom } = useSelector(state => state.chatRoom);
    const { isPrivateChatRoom } = useSelector(state => state.chatRoom);
    const [isFavorite, setIsFavorite] = useState(false);
    const usersRef = ref(db, "users");
    const { currentUser } = useSelector(state => state.user);
    const { userPosts } = useSelector(state => state.chatRoom);

    useEffect(() => {
        if (currentChatRoom?.id && currentUser?.uid) {
            addFavoriteListener(currentChatRoom.id, currentUser.uid)
        }
    }, [currentChatRoom?.id, currentUser?.uid])

    const addFavoriteListener = (chatRoomId, userId) => {
        onValue(child(usersRef, `${userId}/favorite`), data => {
            if (data.val() !== null) {
                const chatRoomIds = Object.keys(data.val());
                const isAlreadyFavorite = chatRoomIds.includes(chatRoomId)
                setIsFavorite(isAlreadyFavorite)
            }
        })
    }

    const handleFavorite = () => {
        if (isFavorite) {
            // setIsFavorite(prev => !prev)
            remove(child(usersRef, `${currentUser.uid}/favorite/${currentChatRoom.id}`))
        } else {
            // setIsFavorite(prev => !prev)
            update(child(usersRef, `${currentUser.uid}/favorite`), {
                [currentChatRoom.id]: {
                    name: currentChatRoom.name,
                    description: currentChatRoom.description,
                    createdBy: {
                        name: currentChatRoom.createdBy.name,
                        image: currentChatRoom.createdBy.image
                    }
                }
            })
        }
    }

    const renderUserPosts = (userPosts) =>
        Object.entries(userPosts)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([key, val], i) => (
                <div key={i} style={{ display: 'flex' }}>
                    <Image
                        style={{ width: '45px', height: '45px', marginRight: 10 }}
                        roundedCircle
                        src={val.image}
                        alt={val.name}
                    />
                    <div>
                        <h6>{key} </h6>
                        <p>
                            {val.count} 개
                        </p>
                    </div>
                </div>
            ))

    return (
        <div style={{
            width: '100%',
            height: '190px',
            border: '.2rem solid #ececec',
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '1rem'
        }} >
            <Row>
                <Col>
                    <h2>
                        {isPrivateChatRoom ?
                            <FaLock style={{ marginBottom: '10px' }} />
                            :
                            <FaLockOpen style={{ marginBottom: '10px' }} />
                        }
                        {" "}
                        {currentChatRoom && <span>{currentChatRoom.name}</span>}
                        {" "}
                        {!isPrivateChatRoom &&
                            <span style={{ cursor: 'pointer' }} onClick={handleFavorite}>
                                {isFavorite ?
                                    <MdFavorite style={{ marginBottom: '10px' }} />
                                    :
                                    <MdFavoriteBorder style={{ marginBottom: '10px' }} />
                                }
                            </span>
                        }
                    </h2>
                </Col>

                <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">
                            <AiOutlineSearch />
                        </InputGroup.Text>
                        <FormControl
                            onChange={handleSearchChange}
                            placeholder="Search Messages"
                            aria-label="Search"
                            aria-describedby="basic-addon1"
                        />
                    </InputGroup>
                </Col>
            </Row>

            {!isPrivateChatRoom &&
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Image
                        src={currentChatRoom?.createdBy.image}
                        style={{ width: '30px', height: '30px', marginRight: 7 }}
                        roundedCircle
                    />{" "}
                    <p>{currentChatRoom?.createdBy.name}</p>
                </div>
            }

            <Row>
                <Col>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Description</Accordion.Header>
                            <Accordion.Collapse eventKey="0">
                                <Accordion.Body>
                                    {currentChatRoom?.description}
                                </Accordion.Body>
                            </Accordion.Collapse>
                        </Accordion.Item>
                    </Accordion>
                </Col>
                <Col>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Posts Count</Accordion.Header>
                            <Accordion.Collapse eventKey="0">
                                <Accordion.Body>
                                    {userPosts && renderUserPosts(userPosts)}
                                </Accordion.Body>
                            </Accordion.Collapse>
                        </Accordion.Item>
                    </Accordion>
                </Col>
            </Row>
        </div >
    )
}

export default MessageHeader
