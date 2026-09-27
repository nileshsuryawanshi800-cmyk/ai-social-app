/* =========================================
   AI SOCIAL
   Main Application Data Layer
   ========================================= */

const AI_SOCIAL = {

    VERSION: "1.0.0",

    keys: {
        accounts: "ai_accounts",
        activeAccount: "ai_active_account",
        posts: "ai_posts",
        stories: "ai_stories",
        messages: "ai_messages",
        notifications: "ai_notifications",
        follows: "ai_follows",
        saved: "ai_saved",
        settings: "ai_settings"
    },

    /* =========================
       STORAGE
       ========================= */

    get(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);

            if (value === null) {
                return fallback;
            }

            return JSON.parse(value);

        } catch (error) {

            console.error("Storage read error:", error);
            return fallback;
        }
    },

    set(key, value) {
        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.error("Storage write error:", error);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    /* =========================
       ID
       ========================= */

    id(prefix = "id") {

        return prefix +
            "_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 10);
    },

    /* =========================
       CURRENT ACCOUNT
       ========================= */

    getAccounts() {

        return this.get(
            this.keys.accounts,
            []
        );
    },

    saveAccounts(accounts) {

        return this.set(
            this.keys.accounts,
            accounts
        );
    },

    getCurrentUser() {

        const activeId = this.get(
            this.keys.activeAccount,
            null
        );

        const accounts = this.getAccounts();

        if (!activeId) {
            return null;
        }

        return accounts.find(
            account => account.id === activeId
        ) || null;
    },

    setCurrentUser(accountId) {

        return this.set(
            this.keys.activeAccount,
            accountId
        );
    },

    logout() {

        this.remove(
            this.keys.activeAccount
        );

        window.location.href =
            "signup.html";
    },

    /* =========================
       POSTS
       ========================= */

    getPosts() {

        return this.get(
            this.keys.posts,
            []
        );
    },

    savePosts(posts) {

        return this.set(
            this.keys.posts,
            posts
        );
    },

    addPost(post) {

        const posts = this.getPosts();

        posts.unshift(post);

        return this.savePosts(posts);
    },

    deletePost(postId) {

        let posts = this.getPosts();

        posts = posts.filter(
            post => post.id !== postId
        );

        return this.savePosts(posts);
    },

    findPost(postId) {

        const posts = this.getPosts();

        return posts.find(
            post => String(post.id) === String(postId)
        ) || null;
    },

    /* =========================
       STORIES
       ========================= */

    getStories() {

        return this.get(
            this.keys.stories,
            []
        );
    },

    saveStories(stories) {

        return this.set(
            this.keys.stories,
            stories
        );
    },

    addStory(story) {

        const stories = this.getStories();

        stories.push(story);

        return this.saveStories(stories);
    },

    /* =========================
       FOLLOWS
       ========================= */

    getFollows() {

        return this.get(
            this.keys.follows,
            []
        );
    },

    saveFollows(follows) {

        return this.set(
            this.keys.follows,
            follows
        );
    },

    isFollowing(userId) {

        const current =
            this.getCurrentUser();

        if (!current) {
            return false;
        }

        const follows =
            this.getFollows();

        return follows.some(
            item =>
                item.followerId === current.id &&
                item.followingId === userId
        );
    },

    follow(userId) {

        const current =
            this.getCurrentUser();

        if (!current || current.id === userId) {
            return false;
        }

        const follows =
            this.getFollows();

        const exists = follows.some(
            item =>
                item.followerId === current.id &&
                item.followingId === userId
        );

        if (!exists) {

            follows.push({

                id: this.id("follow"),

                followerId:
                    current.id,

                followingId:
                    userId,

                createdAt:
                    Date.now()

            });

        }

        return this.saveFollows(follows);
    },

    unfollow(userId) {

        const current =
            this.getCurrentUser();

        if (!current) {
            return false;
        }

        let follows =
            this.getFollows();

        follows =
            follows.filter(
                item =>
                    !(
                        item.followerId === current.id &&
                        item.followingId === userId
                    )
            );

        return this.saveFollows(follows);
    },

    /* =========================
       SAVED POSTS
       ========================= */

    getSaved() {

        return this.get(
            this.keys.saved,
            []
        );
    },

    savePost(postId) {

        const saved =
            this.getSaved();

        if (!saved.includes(postId)) {

            saved.push(postId);

            this.set(
                this.keys.saved,
                saved
            );
        }
    },

    unsavePost(postId) {

        let saved =
            this.getSaved();

        saved =
            saved.filter(
                id => id !== postId
            );

        this.set(
            this.keys.saved,
            saved
        );
    },

    isSaved(postId) {

        return this
            .getSaved()
            .includes(postId);
    },

    /* =========================
       MESSAGES
       ========================= */

    getMessages() {

        return this.get(
            this.keys.messages,
            []
        );
    },

    saveMessages(messages) {

        return this.set(
            this.keys.messages,
            messages
        );
    },

    sendMessage(receiverId, text, options = {}) {

        const current =
            this.getCurrentUser();

        if (!current || !text.trim()) {
            return false;
        }

        const messages =
            this.getMessages();

        messages.push({

            id: this.id("message"),

            senderId:
                current.id,

            receiverId:
                receiverId,

            text:
                text.trim(),

            media:
                options.media || null,

            mediaType:
                options.mediaType || null,

            disappearing:
                options.disappearing || false,

            seen:
                false,

            createdAt:
                Date.now()

        });

        return this.saveMessages(
            messages
        );
    },

    /* =========================
       NOTIFICATIONS
       ========================= */

    getNotifications() {

        return this.get(
            this.keys.notifications,
            []
        );
    },

    saveNotifications(notifications) {

        return this.set(
            this.keys.notifications,
            notifications
        );
    },

    notify(userId, type, data = {}) {

        const notifications =
            this.getNotifications();

        notifications.unshift({

            id: this.id("notification"),

            userId,

            type,

            data,

            read: false,

            createdAt:
                Date.now()

        });

        return this.saveNotifications(
            notifications
        );
    },

    /* =========================
       SEARCH
       ========================= */

    search(query) {

        query =
            query
                .toLowerCase()
                .trim();

        if (!query) {
            return [];
        }

        const accounts =
            this.getAccounts();

        const posts =
            this.getPosts();

        const users =
            accounts.filter(account =>

                account.username
                    .toLowerCase()
                    .includes(query)

                ||

                (account.name || "")
                    .toLowerCase()
                    .includes(query)

            );

        const matchingPosts =
            posts.filter(post =>

                (post.text || "")
                    .toLowerCase()
                    .includes(query)

                ||

                (post.username || "")
                    .toLowerCase()
                    .includes(query)

            );

        return {

            users,

            posts:
                matchingPosts

        };
    },

    /* =========================
       UTILITY
       ========================= */

    escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    timeAgo(timestamp) {

        const seconds =
            Math.floor(
                (Date.now() - timestamp) / 1000
            );

        if (seconds < 60) {
            return "now";
        }

        const minutes =
            Math.floor(seconds / 60);

        if (minutes < 60) {
            return `${minutes}m`;
        }

        const hours =
            Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours}h`;
        }

        const days =
            Math.floor(hours / 24);

        if (days < 7) {
            return `${days}d`;
        }

        return new Date(timestamp)
            .toLocaleDateString();
    }

};


/* =========================================
   GLOBAL SHORTCUTS
   ========================================= */

window.AISocial = AI_SOCIAL;


/* =========================================
   SERVICE WORKER
   ========================================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./sw.js")
                .catch(error => {

                    console.error(
                        "Service worker error:",
                        error
                    );

                });

        }
    );

}
