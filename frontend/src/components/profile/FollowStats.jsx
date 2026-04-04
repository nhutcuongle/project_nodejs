import React, { useEffect } from "react";

const FollowStats = ({
  followersCount,
  followingCount,
  likesCount,
  onShowModal,
}) => {
  useEffect(() => {
    console.log("📊 [FollowStats] Render →", {
      followersCount,
      followingCount,
      likesCount,
    });
  }, [followersCount, followingCount, likesCount]);

  return (
    <div className="flex justify-center sm:justify-start gap-6 mt-4 text-white text-base sm:text-lg">
      <span
        className="cursor-pointer hover:underline font-semibold"
        onClick={() => onShowModal("following")}
      >
        {followingCount} Đang follow
      </span>
      <span
        className="cursor-pointer hover:underline font-semibold"
        onClick={() => onShowModal("followers")}
      >
        {followersCount} Followers
      </span>
      <span className="font-semibold">{likesCount || 0} Lượt thích</span>
    </div>
  );
};

export default FollowStats;
