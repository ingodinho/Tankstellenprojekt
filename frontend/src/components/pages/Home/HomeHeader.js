import styled from "styled-components";
import ProfilePic from "../../shared/ProfilePic";
import BirdLogoUrl from "../../../img/icons/Bird Logo.svg";
import FeatureIcon from "../../../img/icons/Feature stroke icon.svg";
import {Link, useNavigate} from "react-router-dom";
import {useSetRecoilState} from "recoil";
import {loggedInUser} from "../../utils/SharedStates";

const HomeHeader = () => {
    const navigator = useNavigate();
    const setUserData = useSetRecoilState(loggedInUser);

    const logoutHandler = () => {
        setUserData({});
        localStorage.clear();
        navigator('/')
    }

  return (
    <HeaderWrapper>
      <IconBar>
        <ProfilePic size={"small"} />
        <Link to={"/home"}>
          <BirdLogo src={BirdLogoUrl} alt="Bird Logo" />
        </Link>
        <img onClick={logoutHandler} src={FeatureIcon} alt="Feature Icon" />
      </IconBar>
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  background-color: #fff;
  padding: 2rem var(--spacing-wrapper) 0.5rem var(--spacing-wrapper);
  border-bottom: 1px solid var(--clr-line-grey);
`;

const IconBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BirdLogo = styled.img`
  width: 27px;
  height: 27px;
`;

export default HomeHeader;
