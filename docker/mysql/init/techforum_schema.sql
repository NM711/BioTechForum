CREATE TABLE `User` (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email_hash VARCHAR(255) DEFAULT NULL,
        password_hash VARCHAR(255) UNIQUE NOT NULL,
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
);

CREATE INDEX IndexUser ON `User` (`id`, `username`);

CREATE TABLE `Session` (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP() + INTERVAL 15 DAY),
        FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE
);

CREATE INDEX IndexSession ON `Session`(`user_id`, `id`);

CREATE TABLE `SudoSession` (
        id VARCHAR(255) PRIMARY KEY,
        active_session_id VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        expires_at  TIMESTAMP DEFAULT (CURRENT_TIMESTAMP() + INTERVAL 5 MINUTE),
        FOREIGN KEY (`active_session_id`) REFERENCES `Session`(`id`) ON DELETE CASCADE
);

CREATE INDEX IndexSudoSession ON `SudoSession`(`active_session_id`, `id`);


CREATE TABLE `OneTimePassword` (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP() + INTERVAL 5 MINUTE),
        FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE
);


CREATE TABLE `Post` (
        id VARCHAR(255) PRIMARY KEY,
        author_id VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(75) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        FOREIGN KEY (`author_id`) REFERENCES `User`(`id`)
);

CREATE INDEX IndexPost ON `Post`(`id`, `author_id`);

CREATE TABLE `PostMedia` (
        id VARCHAR(255) PRIMARY KEY,
        post_id VARCHAR(255) UNIQUE NOT NULL,
        media_url TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        FOREIGN KEY (`post_id`) REFERENCES `Post`(`id`)
);

CREATE TABLE `PostComment` (
        id VARCHAR(255) PRIMARY KEY,
        post_id VARCHAR(255) UNIQUE NOT NULL,
        author_id VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        FOREIGN KEY (`post_id`) REFERENCES `Post`(`id`),
        FOREIGN KEY (`author_id`) REFERENCES `User`(`id`)
);

CREATE TABLE `PostVote` (
        voter_id VARCHAR(255),
        post_id VARCHAR(255),
        vote_type ENUM('DOWNVOTE', 'UPVOTE') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        PRIMARY KEY (`voter_id`, `post_id`),
        FOREIGN KEY (`voter_id`) REFERENCES `User`(`id`),
        FOREIGN KEY (`post_id`) REFERENCES `Post`(`id`)
);

CREATE TABLE `Community` (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
);

CREATE TABLE `CommunityPost` (
        community_id VARCHAR(255),
        post_id VARCHAR(255),
        PRIMARY KEY (`community_id`, `post_id`),
        FOREIGN KEY (`community_id`) REFERENCES `Community`(`id`),
        FOREIGN KEY (`post_id`) REFERENCES `Post`(`id`)
);

-- If a user is deleted then he can no longer belong to a community, we cascade delete the row
-- If a commmunity is deleted then we can no longer have users in it, we cascade delete the row

CREATE TABLE `CommunityUser` (
        community_id VARCHAR(255),
        user_id VARCHAR(255),
        alias VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        PRIMARY KEY (`community_id`, `user_id`),
        FOREIGN KEY (`community_id`) REFERENCES `Community`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE
);

CREATE TABLE `CommunityRole` (
        id VARCHAR(255) PRIMARY KEY,
        community_id VARCHAR(255) UNIQUE NOT NULL,
        role_alias VARCHAR(255) NOT NULL,
        authority ENUM('MEMBER', 'ADMINISTRATOR', 'OWNER') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
        FOREIGN KEY (`community_id`) REFERENCES `Community`(`id`) ON DELETE CASCADE
);

CREATE TABLE `CommunityUserRole` (
        community_role_id VARCHAR(255),
        user_id VARCHAR(255),
        -- Needed in order to keep a log of when certain things are assigned at
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
        PRIMARY KEY (`community_role_id`, `user_id`),
        FOREIGN KEY (`community_role_id`) REFERENCES `CommunityRole`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE
);
