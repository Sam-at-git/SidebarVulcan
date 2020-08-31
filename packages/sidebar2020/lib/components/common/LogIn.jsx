import { Components, useCurrentUser } from 'meteor/vulcan:core';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'qs';
import PageLayout from './PageLayout';
import OneGraphAuth from 'onegraph-auth';
import { useApolloClient } from '@apollo/react-hooks';
import { useCookies } from 'react-cookie';

// Sidebar's OneGraph appId
// const APP_ID = 'ab70c14a-a1e0-4f9b-9a38-5ebda9792f3f';
const APP_ID = '9550429e-f67e-46d8-8722-5682336ed191';

// OneGraphAuth uses the window object to display the popup, we need to check it exists due to SSR.
export const auth =
  typeof window !== 'undefined'
    ? new OneGraphAuth({
        appId: APP_ID,
      })
    : {
        authHeaders: () => {},
        appId: APP_ID,
      };

const login = async ({ service, onLoggedIn }) => {
  window.ogAuth = auth;

  try {
    // eslint-disable-next-line
    console.log('Logging into ', service);
    await auth.login(service);
    const isLoggedIn = await auth.isLoggedIn(service);
    // eslint-disable-next-line
    isLoggedIn ? onLoggedIn() : console.log('Did not grant auth for ' + service);
  } catch (e) {
    // eslint-disable-next-line
    console.error('Problem logging into ' + service, e);
  }
};

const LogIn = () => {
  const client = useApolloClient();
  const [cookies, setCookie] = useCookies();

  const { loading, currentUser } = useCurrentUser();
  const history = useHistory();
  const location = useLocation();
  const query = qs.parse(location.search, { ignoreQueryPrefix: true });
  const { redirect = '/' } = query;
  return (
    <PageLayout name="log-in" title="Log In Or Sign Up">
      {loading ? (
        <Components.Loading />
      ) : currentUser ? (
        <p>You are already logged in.</p>
      ) : (
        <div>
          <p>Log in or sign up using Twitter</p>
          <button
            onClick={() => {
              login({
                service: 'twitter',
                onLoggedIn: async () => {
                  // eslint-disable-next-line
                  // eslint-disable-next-line
                  const authToken = auth.accessToken().accessToken;
                  console.log('\tauth!', authToken);
                  console.log(client)
                  setCookie('og_auth_token', authToken);
                  console.log("Set the cookie to ", authToken);
                  const z = cookies['og_auth_token'];
                  console.log("Got the cookie: ", z);

                  await client.resetStore();
                  // history.push(`/log-in/finish/?redirect=${redirect}`);
                },
              });
            }}
          >
            Twitter(custom)
          </button>
          <Components.AccountsLoginForm
            showSignUpLink={false}
            onSignedInHook={() => {
              history.push(`/log-in/finish/?redirect=${redirect}`);
            }}
          />
        </div>
      )}
    </PageLayout>
  );
};

export default LogIn;
