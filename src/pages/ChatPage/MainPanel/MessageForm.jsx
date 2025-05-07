import React, { useState, useRef } from 'react'
import ProgressBar from 'react-bootstrap/ProgressBar';
import { db } from '../../../firebase';
import { useSelector } from 'react-redux';

import { ref, set, remove, push, child, serverTimestamp } from "firebase/database";
import { getStorage, ref as strRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function MessageForm() {
    const [content, setContent] = useState("")
    const [errors, setErrors] = useState([])
    const [loading, setLoading] = useState(false)
    const [percentage, setPercentage] = useState(0)
    const messagesRef = ref(db, "messages")
    const inputOpenImageRef = useRef();

    // const storageRef = ref(getStorage());
    const typingRef = ref(db, "typing");

    const { currentChatRoom } = useSelector(state => state.chatRoom);
    const { currentUser } = useSelector(state => state.user)
    const { isPrivateChatRoom } = useSelector(state => state.chatRoom);

    const handleChange = (event) => {
        setContent(event.target.value);

        if (event.target.value) {
            set(ref(db, `typing/${currentChatRoom.id}/${currentUser.uid}`), {
                userUid: currentUser.displayName
            })
        } else {
            remove(ref(db, `typing/${currentChatRoom.id}/${currentUser.uid}`))
        }
    }

    const createMessage = (fileUrl = null) => {
        const message = {
            timestamp: serverTimestamp(),
            user: {
                id: currentUser.uid,
                name: currentUser.displayName,
                image: currentUser.photoURL
            }
        }

        if (fileUrl !== null) {
            message["image"] = fileUrl;
        } else {
            message["content"] = content;
        }

        return message;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content) {
            setErrors(prev => prev.concat("Type contents first"))
            return;
        }
        setLoading(true);
        //firebase에 메시지를 저장하는 부분 
        try {
            // await messagesRef.child(chatRoom.id).push().set(createMessage())
            await set(push(child(messagesRef, currentChatRoom.id)), createMessage())

            // typingRef.child(chatRoom.id).child(user.uid).remove();
            await remove(child(typingRef, `${currentChatRoom.id}/${currentUser.uid}`));
            setLoading(false)
            setContent("")
            setErrors([])
        } catch (error) {
            setErrors(pre => pre.concat(error.message))
            setLoading(false)
            setTimeout(() => {
                setErrors([])
            }, 5000);
        }
    }

    const handleOpenImageRef = () => {
        inputOpenImageRef.current.click()
    }

    const getPath = () => {
        if (isPrivateChatRoom) {
            return `/message/private/${currentChatRoom.id}`
        } else {
            return `/message/public`
        }
    }

    const handleUploadImage = (event) => {
        const file = event.target.files[0];
        const storage = getStorage();

        const filePath = `${getPath()}/${file.name}`;
        console.log('filePath', filePath);
        const metadata = { contentType: file.type }
        setLoading(true)
        try {
            // https://firebase.google.com/docs/storage/web/upload-files#full_example
            // Upload file and metadata to the object 'images/mountains.jpg'
            const storageRef = strRef(storage, filePath);
            const uploadTask = uploadBytesResumable(storageRef, file, metadata);

            // Listen for state changes, errors, and completion of the upload.
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    setPercentage(Math.round(progress));
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                },
                (error) => {
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    switch (error.code) {
                        case 'storage/unauthorized':
                            // User doesn't have permission to access the object
                            break;
                        case 'storage/canceled':
                            // User canceled the upload
                            break;
                        // ...
                        case 'storage/unknown':
                            // Unknown error occurred, inspect error.serverResponse
                            break;
                    }
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // console.log('File available at', downloadURL);
                        set(push(child(messagesRef, currentChatRoom.id)), createMessage(downloadURL))
                        setLoading(false)
                    });
                }
            );
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <textarea
                    style={{ width: '100%', height: 90, border: "0.2rem solid rgb(236, 236, 236)", borderRadius: 4 }}
                    value={content}
                    onChange={handleChange}
                />


                {
                    !(percentage === 0 || percentage === 100) &&
                    <ProgressBar variant="warning" label={`${percentage}%`} now={percentage} />
                }

                <div>
                    {errors.map(errorMsg => <p style={{ color: 'red' }} key={errorMsg}>
                        {errorMsg}
                    </p>)}
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flexGrow: 1 }}>
                        <button
                            type='submit'
                            className="message-form-button"
                            style={{ width: '100%', fontSize: 20, fontWeight: 'bold' }}
                            disabled={loading ? true : false}
                        >
                            보내기
                        </button>
                    </div>
                    <div style={{ flexGrow: 1 }}>
                        <button
                            type='button'
                            onClick={handleOpenImageRef}
                            className="message-form-button"
                            style={{ width: '100%', fontSize: 20, fontWeight: 'bold' }}
                            disabled={loading ? true : false}
                        >
                            이미지
                        </button>
                    </div>
                </div>
            </form>

            <input
                accept="image/jpeg, image/png"
                style={{ display: 'none' }}
                type="file"
                ref={inputOpenImageRef}
                onChange={handleUploadImage}
            />
        </div>
    )
}

export default MessageForm
