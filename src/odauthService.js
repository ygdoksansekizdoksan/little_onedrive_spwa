
/*
 This is a modified library, for original goto : 
                                  - https://github.com/tmathew1000/OneDriveWebPicker/blob/c371f9970153e3f8484a8001c017733644d5dc70/OneDriveWebPicker/odauth.js
                                  - http://web.archive.org/web/20181205150919/https://github.com/tmathew1000/OneDriveWebPicker/blob/c371f9970153e3f8484a8001c017733644d5dc70/OneDriveWebPicker/odauth.js

 =====================================INSTRUCTIONS=======================================
 Host a copy of callback.html and odauthService.js on your domain.

 Before requesting authentication you must provide authorisation information.
 Call provideAppInfo(appInfo) passing appInfo.

  appInfoStructure = {
    "clientId" : "clientId_from_graph_account"
    "redirectUri" : "example_redirect_uri"
    "scopes" : "example_scopes"
    "authServiceUri" : "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
  }
=========================================================================================


  
========================================HOW IT WORKS=============================================
  When challengeForAuth() is called a pop up window is opened the user send to Microsoft Account login. 
  User can sign in and may request app permissions. When the user finishes the
  auth flow, the popup window redirects back to your hosted callback.html file,
  which calls the onAuthCallback() method below. It extracts the auth token
  and calls your app's onAuthenticated() function, passing in the 'window'
  and token arguments for the popup window. Your onAuthenticated function should close the
  popup window.
=================================================================================================

*/


// for added security we require https
function ensureHttps() {
  if (window.location.protocol != "https:") {
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
  }
}

// Called when user finishes the OneDrive auth flow
// Calls the onAuthenticated() function passing in the 'window' and
// token arguments
function onAuthCallback() {
  console.log('callback');
  var authInfo = getAuthInfoFromUrl();
  var token = authInfo["access_token"];
  window.opener.onAuthenticated(token, window);
}

// Extracts the auth token from URL
function getAuthInfoFromUrl() {
  if (window.location.hash) {
    var authResponse = window.location.hash.substring(1);
    var authInfo = JSON.parse(
      '{"' + authResponse.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
      function (key, value) { return key === "" ? value : decodeURIComponent(value); });
    return authInfo;
  }
  else {
    console.error("failed to receive auth token");
  }
}



var storedAppInfo = null;

// Stores appInfo
function provideAppInfo(appInfo) {

  if (!appInfo.hasOwnProperty("clientId")) { throw ("clientId was not defined"); }
  if (!appInfo.hasOwnProperty("redirectUri")) { throw ("redirectUri was not defined"); }
  if (!appInfo.hasOwnProperty("scopes")) { throw ("scopes was is defined"); }
  if (!appInfo.hasOwnProperty("authServiceUri")) { throw ("authServiceUri was not defined"); }

  storedAppInfo = appInfo;
}

function getAppInfo() {

  if (storedAppInfo) {
    return storedAppInfo;
  }

  throw ("No AppInfo was provided, make sure provedAppInfo() was called");
}


// Attempts a OneDrive Login, opening a new window prompting user to login into
// OneDrive. 
function challengeForAuth() {
  try {
    var appInfo = getAppInfo();
    var url =
      appInfo.authServiceUri +
      "?client_id=" + appInfo.clientId +
      "&scope=" + encodeURIComponent(appInfo.scopes) +
      "&response_type=token" +
      "&redirect_uri=" + encodeURIComponent(appInfo.redirectUri);
    popup(url);
  } catch (error) {
    throw (error);
  }
}

function popup(url) {
  var width = 525,
    height = 525,
    screenX = window.screenX,
    screenY = window.screenY,
    outerWidth = window.outerWidth,
    outerHeight = window.outerHeight;

  var left = screenX + Math.max(outerWidth - width, 0) / 2;
  var top = screenY + Math.max(outerHeight - height, 0) / 2;

  var features = [
    "width=" + width,
    "height=" + height,
    "top=" + top,
    "left=" + left,
    "status=no",
    "resizable=yes",
    "toolbar=no",
    "menubar=no",
    "personalbar=no",
    "scrollbars=yes"];

  var popup = window.open(url, "oauth", features.join(","));
  if (!popup) {
   console.error("failed to pop up auth window");
  }

  popup.focus();
}