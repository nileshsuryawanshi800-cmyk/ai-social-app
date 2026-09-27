/* =========================================
   AI SOCIAL AUTHENTICATION
   ========================================= */

function getAccounts() {

    return AISocial.getAccounts();

}


function createAccountFromSystem(data) {
    const accounts =
        getAccounts();

    const username =
        data.username
            .replace(/^@/, "")
            .trim();

    if (!username) {

        return {
            success: false,
            error: "Username is required."
        };

    }


    const usernameExists =
        accounts.some(
            account =>
                account.username
                    .toLowerCase() ===
                username.toLowerCase()
        );


    if (usernameExists) {

        return {
            success: false,
            error: "Username already exists."
        };

    }


    if (username.length < 3) {

        return {
            success: false,
            error:
                "Username must contain at least 3 characters."
        };

    }


    const account = {

        id:
            AISocial.id("user"),

        name:
            data.name || username,

        username,

        bio:
            data.bio || "",

        profileImage:
            data.profileImage || "",

        private:
            false,

        verified:
            false,

        followers:
            0,

        following:
            0,

        createdAt:
            Date.now()

    };


    accounts.push(account);

    AISocial.saveAccounts(accounts);

    AISocial.setCurrentUser(
        account.id
    );


    return {

        success: true,

        account

    };

}


function loginAccount(accountId) {

    const accounts =
        getAccounts();

    const account =
        accounts.find(
            item => item.id === accountId
        );

    if (!account) {
        return false;
    }

    return AISocial.setCurrentUser(
        account.id
    );
}


function getCurrentUser() {

    return AISocial.getCurrentUser();

}


function logoutAccount() {

    AISocial.logout();

}
