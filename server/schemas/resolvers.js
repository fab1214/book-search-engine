const {User} = require('../models');

const { AuthenticationError} = require('apollo-server-express');
const { signToken }= require ('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user){
                const userData = await User.findOne({_id: context.user._id})
                .select('-__v -password')
                // .populate('savedBooks');

                return userData;
            }
            throw new AuthenticationError('Not logged in');
        },
    },

    //create user mutation
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return {token, user};
        },
        
        //pass in email and password to login mutation
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});
            if(!user){
                throw new AuthenticationError('Incorrect credetials entered');
            }

            const correctPassword = await user.isCorrectPasseord(password);
            //if password is incorrect, throw authentication error
            if(!correctPassword){
                throw new AuthenticationError('Incorrect credneials entered');
            }

            const token = signToken(user);

            return {token, user} ;
        },
        //saveBook mutation
        saveBook: async (parent, {bookData}, context) => {
            if(context.user){
                const user = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$push : {savedBooks: bookData} },
                    {new: true, runValidators: true}
                );
                return user;
            }
            throw new AuthenticationError("You must be logged in");
        },

        removeBook: async(parent, {bookId}, context) => {
            if(context.user){
                const user = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: { bookId: bookId } } },
                    {new: true, runValidators: true}
                );
                return user;
            }
            throw new AuthenticationError('You must be logged in');
        }
    },
};

module.exports = resolvers;