import GlobalStyles from "./GlobalStyles";
import {useEffect, useState} from "react";
import {Routes, Route, useNavigate} from "react-router-dom";
import socketIO from 'socket.io-client'

import Home from "./components/pages/Home/Home";
import LoginPage from "./components/pages/Login/LoginPage";
import RegisterPage from "./components/pages/Register/RegisterPage";
import TweetDetails from "./components/pages/TweetDetails/TweetDetails";
import Profile from "./components/pages/ProfilePage/Profile";
import NewTweet from "./components/pages/NewTweet/NewTweet";
import StartPage from "./components/pages/Start/StartPage";
import Search from "./components/pages/Search/SearchPage";
import EditProfile from "./components/pages/EditProfile/EditProfilePage";
import {useRecoilState} from "recoil";
import {loggedInUser} from "./components/utils/SharedStates";
import ReplyTweet from "./components/pages/ReplyTweet/ReplyTweet";
import AuthAndNav from "./components/shared/AuthAndNav/AuthAndNav";
import Redirect from "./components/shared/Tweet/Redirect";
import EmailValidation from "./components/pages/EmailValidation/EmailValidation";
import FollowerList from "./components/pages/FollowerList/FollowerList";
import MessengerPage from "./components/pages/Messenger/MessengerPage";
import {apiLink} from "./components/utils/apiLink";

function App() {
    // const socket = socketIO(apiLink, {autoConnect: false});
    // socket.onAny((event, ...args) => {
    //     console.log(event, args);
    // })
    const navigator = useNavigate();
    const [userData, setUserData] = useRecoilState(loggedInUser);

    // useEffect(() => {
    //     if (!userData) return;
    //     socket.auth = {userId: userData.userId};
    //     socket.connect();
    //     console.log('useeffect', socket);
    //     return () => {
    //         socket.disconnect();
    //     }
    // }, [userData]);

    return (
        <div className="App">
            <Routes>
                <Route element={<AuthAndNav/>}>
                    <Route path={"/home"} element={<Home/>}/>
                    <Route path={"/search"} element={<Search/>}/>
                    <Route path={"/tweet/:id"} element={<TweetDetails/>}/>
                    <Route path={"/profile/:id"} element={<Profile/>}/>
                    <Route path={"/profile/:id/edit"} element={<EditProfile/>}/>
                    <Route path={"/newtweet"} element={<NewTweet/>}/>
                    <Route path={"/reply/:id"} element={<ReplyTweet/>}/>
                    <Route path={"/messenger"} element={<MessengerPage/>}/>
                    <Route path={'/followerlist/:id/:defaultnav'} element={<FollowerList/>}/>
                </Route>
                <Route element={<Redirect/>}>
                    <Route path={"/"} element={<StartPage/>}/>
                    <Route path={"/login"} element={<LoginPage/>}/>
                    <Route path={"/register"} element={<RegisterPage/>}/>
                </Route>
                <Route path={'/validation'} element={<EmailValidation/>}/>
                <Route path={'*'} element={<h1>Page not Found</h1>}></Route>
            </Routes>
            <GlobalStyles/>
        </div>
    );
}

export default App;
