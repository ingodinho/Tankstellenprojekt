import {
    Content,
    TweetHeader,
    Headline,
    Info,
    Stats,
    StatsWrapper,
    Time,
    UserInfo,
    UserPic,
    Wrapper, Header, HomeLink
} from './TweetDetails.styling';
import Moment from "react-moment";
import {useNavigate} from "react-router-dom";

import Tweet from "../../shared/Tweet/Tweet";
import {placeHolderUser, placeHolderTweet} from "../../placeholder";
import Userplaceholder from '../../../img/profileplaceholder.jpeg';
import TweetStats from "../../shared/Tweet/TweetStats";
import {useEffect, useState} from "react";

const TweetDetails = (props) => {

    const navigator = useNavigate()
    const toProfile = (id) => {
        navigator(`/profile/${id}`)
    }

    if (props.content) {
        placeHolderUser = {...props};
    }

    return (
        <>
            <Header>
                <HomeLink to={'/home'}>Back</HomeLink>
                <Headline>Tweet</Headline>
            </Header>
            <Wrapper>
                <TweetHeader onClick={()=> toProfile(placeHolderUser.userName)}>
                    <UserPic src={Userplaceholder} alt="Profile Pic"/>
                    <UserInfo>
                        <p>{placeHolderUser.firstName} {placeHolderUser.lastName}</p>
                        <span>@{placeHolderUser.userName}</span>
                    </UserInfo>
                </TweetHeader>
                <Content>
                    <p>{placeHolderTweet.content}</p>
                    {placeHolderTweet.imgLink && <img src={placeHolderTweet.imgLink} alt={'embedded in Tweet'}/>}
                </Content>
                <Info>
                    <Time><Moment format={`HH:MM - MM/DD/YY`}>{placeHolderTweet.createdAt}</Moment></Time>
                    <span>&#183;</span>
                    <p>Tweety Web App</p>
                </Info>
                <StatsWrapper>
                    <Stats>
                        <p>{placeHolderTweet.retweets.length}</p>
                        <span>Retweets</span>
                    </Stats>
                    <Stats>
                        <p>{placeHolderTweet.likes.length}</p>
                        <span>Likes</span>
                    </Stats>
                </StatsWrapper>
                <TweetStats big/>
            </Wrapper>
        </>
    );
};

export default TweetDetails;
