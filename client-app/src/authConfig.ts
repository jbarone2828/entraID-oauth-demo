import type { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "d814695a-c790-4261-b4bc-0b537717c148", 
    authority: "https://login.microsoftonline.com/33c07ecc-5201-4954-b5e8-9b1b6205c597",
    redirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};

export const apiRequest = {
  scopes: ["api://d814695a-c790-4261-b4bc-0b537717c148/access_as_user"]
};