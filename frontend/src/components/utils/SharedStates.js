import {atom, atomFamily} from 'recoil';

export const loggedInUser = atom({
    key: 'loggedInUser',
    default: null
})

export const slideInMenu = atom({
    key: 'slideInMenu',
    default: false
})

export const handleModal = atom({
    key:'handleModal',
    default: false,
})

export const modalId = atom({
    key: 'modalId',
    default: null
})

export const forceRerender = atom({
    key: 'forceRerender',
    default: 1
})

export const tweetStateFamily = atomFamily({
    key: 'tweetsFamily',
    default: {
        content: null,
        imgLink: null,
        lastEditedAt: null,
        likes: [],
        postedAt: null,
        postedBy: {

        },
        replies: [],
        replyTo: null,
        retweets: [],
        _id: null,
    }
})