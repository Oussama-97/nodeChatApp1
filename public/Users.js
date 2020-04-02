class Users {
    static count = 0;

    constructor () {
        this.users = [];
    }

    addUser(id, name, conversations) {
        var user = {id, number : Users.count, name, conversations : {}};
        this.users.push(user);

        Users.count++ ; 
        return user ;
    }

    getConversation(conversationId) {
        return this.users.conversations.conversationId;
    }

    getUser(id) {
        return this.users.filter( (user) => user.id === id)[0];
    }

    getUserNumber(id) {
        return this.users.filter( (user) => user.id === id)[0].number;
    }

    removeUser(id) {
        var user = this.getUser(id);
        if (user){
            this.users = this.users.filter( (user) => user.id !== id);
        }

        return user;
    }
}

module.exports = {Users};