import React, { useContext, useEffect, useState } from "react";

import { AuthContext } from "../../components/AuthContext";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Flex,
  Box,
  Avatar,
  Text,
  Spacer,
  Center,
} from "@chakra-ui/react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { HamburgerIcon } from "@chakra-ui/icons";

const UserProfileModal = ({ isOpen, onClose, user }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [dbInstance, setDbInstance] = useState(null);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !dbInstance || !user.uid) return; 

      const userRef = collection(dbInstance, "Users");
      const userQuery = query(userRef, where("uid", "==", user.uid));

      const unsubscribeUser = onSnapshot(userQuery, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          setDisplayName(userData.displayName);
          setFollowersCount(userData.followers ? userData.followers.length : 0);
          setFollowingCount(userData.following ? userData.following.length : 0);
          setPostsCount(userData.postsCount || 0);
        });
      });

      const userPostsRef = collection(dbInstance, "Posts");
      const userPostsQuery = query(
        userPostsRef,
        where("userUID", "==", user.uid)
      );

      const postsUnsubscribe = onSnapshot(
        userPostsQuery,
        (userPostsSnapshot) => {
          const postsData = userPostsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserPosts(postsData);
          setPostsCount(postsData.length);
        }
      );

      return () => {
        unsubscribeUser();
        postsUnsubscribe();
      };
    };

    fetchUserData();
  }, [user, dbInstance]);

  useEffect(() => {
    setDbInstance(db);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent justifyContent="center" alignItems="center">
        <Flex alignItems="center" m={5}>
          <Avatar
            src={user ? user.photoURL || "" : ""} 
            alt="avatar"
            w="20"
            h="20"
            mr={4}
          />
          <Flex flexDir="column">
            <Flex alignItems="center">
              <Text fontSize="xl" fontWeight="semibold" mr="2">
                {displayName}
              </Text>
            </Flex>
            <Text marginTop="4" marginBottom="2">
              {postsCount} Posts <Spacer as="span" mx="1" />
              {followersCount} Followers
              <Spacer as="span" mx="1" />
              {followingCount} Following
            </Text>
          </Flex>
        </Flex>
        <Box w={"90%"} borderTop={"1px"} borderColor={"gray.300"}>
          <Center>
            <HamburgerIcon marginTop={2} />
          </Center>
        </Box>
        <Flex justifyContent="center" flexWrap="wrap">
          {userPosts.map((post, index) => (
            <Center key={post.id} style={{ margin: "10px" }}>
              <Box
                style={{
                  width: "420px",
                  height: "300px",
                  position: "relative",
                }}
              >
                <img
                  src={post.imageUrl}
                  alt="Post"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "fallback_image_url";
                  }}
                />
              </Box>
            </Center>
          ))}
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default UserProfileModal;
