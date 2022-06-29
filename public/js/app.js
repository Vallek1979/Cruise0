let auth0 = null;

const fetchAuthConfig = () => fetch("/auth_config.json");

const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId
  });
};


//Load page elements depending on authetication status
//

window.onload = async () => {
  await configureClient();

  updateUI();

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    // show the gated content
    return;
  }

  // NEW - check for the code and state parameters
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {

    // Process the login state
    await auth0.handleRedirectCallback();
    
    updateUI();

    // Use replaceState to redirect the user away and remove the querystring parameters
    window.history.replaceState({}, document.title, "/");
  }
};

//Update UI depending on login status
//
const updateUI = async () => { 
	const isAuthenticated = await auth0.isAuthenticated();

  	document.getElementById("btn-logout").disabled = !isAuthenticated;
 	document.getElementById("btn-login").disabled = isAuthenticated;
  
  	//Show or hide gated content after authentication
  	//
  	if (isAuthenticated) {
    		//document.getElementById("gated-content").classList.remove("hidden");
    	
  		let userProfile = JSON.stringify(await auth0.getUser());
    		let user = JSON.parse(userProfile);
    		if(user ["email_verified"] == false){  
			document.getElementById("ipt-user-profile").textContent = "Error: You need to verify your email address before you can book a Cruise";
			document.getElementById("ipt-user-profile").style.color = "#FF0000";

    		} else {
    			document.getElementById("ipt-user-profile").textContent = "Welcome "+ user["nickname"];
    		}
  	}
};


//Log in button
//
const login = async () => {
  await auth0.loginWithRedirect({
    redirect_uri: window.location.origin
  });
};




//Log out button
//
const logout = () => {
  auth0.logout({
    returnTo: window.location.origin
  });
};

