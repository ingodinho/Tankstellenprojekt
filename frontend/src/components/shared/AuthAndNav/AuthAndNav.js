import BottomNav from "./BottomNav";
import {Outlet, useNavigate} from "react-router-dom";
import {useRecoilState, useRecoilValue} from "recoil";
import {loggedInUser} from "../../utils/SharedStates";
import {useEffect, useState} from "react";
import SlideIn from "../SlideIn/SlideIn";
import {apiLink} from "../../utils/apiLink";
import axios from "axios";
import LoadingPage from "../LoadingPage/LoadingPage";
import Overlay from "../Overlay/Overlay";
import ImageModal from "../ImageModal/ImageModal";

const AuthAndNav = () => {

    const navigator = useNavigate();
    const [userData, setUserData] = useRecoilState(loggedInUser);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userData) {
            if (userData.accessToken) {
                setIsLoading(false);
                return;
            }
        }
        const doSilentRefreshToken = async () => {
            try {
                const response = await axios.post(apiLink + '/users/refreshtoken', {}, {
                    withCredentials: true
                })
                setUserData(response.data);
                const NINE_MINUTES = 9 * 60 * 1000;
                const timeoutId = setTimeout(() => {
                    doSilentRefreshToken();
                    clearTimeout(timeoutId);
                }, NINE_MINUTES);
                setIsLoading(false);
            } catch (err) {
                navigator('/');
            }
        }
        doSilentRefreshToken();
    }, [userData])

    if (isLoading) {
        return <LoadingPage/>
    }


    return (<>
        <SlideIn/>
        <Overlay/>
        <ImageModal/>
        <Outlet/>
        <BottomNav/>
    </>)
}

export default AuthAndNav;