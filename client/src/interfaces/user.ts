export interface UserInterface {
  _id: string;
  avatar: {
    _id: string;
    url: string;
    localPath: string;
  };
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
