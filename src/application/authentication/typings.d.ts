export declare namespace User {
  type Info = {
    name: string;
    email: string;
    preferred_username: string;
    sub: string;
    email_verified: boolean;
    phone_number: string;
    phone_number_verified: boolean;
  };
}
type config = {
  zentao: {
    code: string;
    key: string;
    account: string;
    password: string;
    url: string;
  };
  openid: {
    configUrl: string;
    redirectUrl: string;
    scope: string;
    client: {
      id: string;
      secret: string;
    };
  };
  redis: {
    password: string;
    socket: {
      host: string;
      port: number;
    };
  };
};
