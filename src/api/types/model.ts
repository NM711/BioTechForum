import type { Generated } from "kysely";

namespace DBStructure {
  export interface UserTable {
    id: string | Generated<string>;
    username: string;
    email_hash: string | Generated<null>;
    password_hash: string;
    description?: string;
    picture?: Buffer;
    created_at: Generated<Date>;
  };

  export interface SessionTable {
    id: string | Generated<string>;
    user_id: string;
    expires_at: Date;
    created_at: Generated<Date>;
  };

  export interface SudoSessionTable {
    id: string | Generated<string>;
    active_session_id: string;
    expires_at: Date;
    created_at: Generated<Date>;
  };

  export interface OneTimePasswordTable {
    id: string | Generated<string>;
    user_id: string;
    expires_at: Generated<Date>;
    created_at: Generated<Date>;
  };

  export interface PostTable {
    id: string | Generated<string>;
    author_id: string;
    title: string;
    content: string;
    created_at: Generated<Date>;
    updated_at: Date | Generated<Date>;
  };

  export interface PostAttachmentsTable {
    id: string | Generated<string>;
    post_id: string;
    content: Buffer;
  };

  export interface PostCommentTable {
    id: string | Generated<string>;
    post_id: string;
    author_id: string;
    content: string;
    created_at: Generated<Date>;
    updated_at: Date | Generated<Date>;
  };

  export interface PostVoteTable {
    post_id: string;
    user_id: string;
    vote_type: "UPVOTE" | "DOWNVOTE";
  };

  export interface CommunityTable {
    id: string | Generated<string>;
    name: string;
    member_count: number;
    created_at: Generated<Date>;
    updated_at: Date | Generated<Date>;
  };

  export interface CommunityMemberTable {
    id: string | Generated<string>;
    user_id: string;
    community_id: string;
    role_id: string;
    alias: string;
    created_at: Generated<Date>;
  };

  export interface CommunityRoleTable {
    id: string | Generated<string>;
    community_id: string;
    member_id: string;
    name: string;
    hex_color_tag: string;
    authority: "OWNER" | "ADMIN" | "MEMBER";
  };

  export interface CommunityPostTable {
    id: string | Generated<string>;
    community_id: string;
    member_id: string;
    post_id: string;
  };

  export interface Database {
    User: UserTable;
    Session: SessionTable;
    SudoSession: SudoSessionTable;
    OneTimePassword: OneTimePasswordTable;
    Post: PostTable;
    PostAttachment: PostAttachmentsTable;
    PostVote: PostVoteTable;
    PostComment: PostCommentTable;
    Community: CommunityTable;
    CommunityMember: CommunityMemberTable;
    CommunityRole: CommunityRoleTable;
    CommunityPost: CommunityPostTable;
  };

};

export default DBStructure;
