import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import './App.css';

interface TokenInfo {
  accessToken: string;
  idToken: string;
  expiresOn: Date | null;
}

function App() {
  
  const { instance, accounts } = useMsal();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  useEffect(() => {
    instance.handleRedirectPromise().then((response) => {
      if (response) {
        console.log('Login successful:', response);
        
        setTokenInfo({
          accessToken: response.accessToken,
          idToken: response.idToken,
          expiresOn: response.expiresOn,
        });
      
        const idTokenClaims = response.idTokenClaims;
        setUserInfo(idTokenClaims);
      }
    }).catch((error) => {
      console.error('Redirect error:', error);
    });
  }, [instance]);
  const isAuthenticated = accounts.length > 0;

  const handleLogin = async () => {
    try {
      const response = await instance.loginRedirect(loginRequest);
      console.log('Login successful:', response);
      
      setTokenInfo({
        accessToken: response.accessToken,
        idToken: response.idToken,
        expiresOn: response.expiresOn,
      });

      // Decode ID token to show claims
      const idTokenClaims = response.idTokenClaims;
      setUserInfo(idTokenClaims);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    instance.logoutRedirect();
    setTokenInfo(null);
    setUserInfo(null);
  };

  const callMicrosoftGraph = async () => {
    if (accounts.length === 0) return;

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });

      const data = await graphResponse.json();
      console.log('Microsoft Graph response:', data);
      alert(`Hello ${data.displayName}! Check console for full profile.`);
    } catch (error) {
      console.error('Graph API call failed:', error);
    }
  };

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Azure AD OAuth 2.0 / OIDC Demo</h1>
        <p>Demonstrating Authorization Code Flow with PKCE</p>

        {!isAuthenticated ? (
          <div className="login-section">
            <button onClick={handleLogin} className="login-button">
              🔐 Login with Microsoft
            </button>
            <p className="info">Click to authenticate via Azure AD</p>
          </div>
        ) : (
          <div className="authenticated-section">
            <div className="user-info">
              <h2>✓ Authenticated</h2>
              <p><strong>User:</strong> {accounts[0].name}</p>
              <p><strong>Email:</strong> {accounts[0].username}</p>
            </div>

            {userInfo && (
              <div className="claims-section">
                <h3>ID Token Claims</h3>
                <pre>{JSON.stringify(userInfo, null, 2)}</pre>
              </div>
            )}

            {tokenInfo && (
              <div className="token-section">
                <h3>Access Token (JWT)</h3>
                <textarea 
                  readOnly 
                  value={tokenInfo.accessToken} 
                  rows={4}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '10px' }}
                />
                <p><strong>Expires:</strong> {tokenInfo.expiresOn?.toLocaleString()}</p>
                
                <h3>Decoded Access Token</h3>
                <pre>{JSON.stringify(decodeJWT(tokenInfo.accessToken), null, 2)}</pre>

                <h3>ID Token (JWT)</h3>
                <textarea 
                  readOnly 
                  value={tokenInfo.idToken} 
                  rows={4}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '10px' }}
                />
                
                <h3>Decoded ID Token</h3>
                <pre>{JSON.stringify(decodeJWT(tokenInfo.idToken), null, 2)}</pre>
              </div>
            )}

            <div className="actions">
              <button onClick={callMicrosoftGraph} className="graph-button">
                📊 Call Microsoft Graph API
              </button>
              <button onClick={handleLogout} className="logout-button">
                🚪 Logout
              </button>
            </div>
          </div>
        )}

        <div className="tech-info">
          <h3>What's Happening Here:</h3>
          <ul style={{ textAlign: 'left', maxWidth: '600px' }}>
            <li>✅ OAuth 2.0 Authorization Code Flow with PKCE</li>
            <li>✅ OpenID Connect ID Token (user identity)</li>
            <li>✅ Access Token (API authorization)</li>
            <li>✅ JWT decoding and claims inspection</li>
            <li>✅ Microsoft Graph API integration</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;