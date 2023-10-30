const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

/******************************************* 
DATABASE CONNECTION CODE
********************************************/
//Note that the below variable is a global variable 
//that is initialized in the connectToDb function and used elsewhere.
let db;

//Function to connect to the database
async function connectToDb() {
    const url = 'mongodb://localhost/assignment3db';
    const client = new MongoClient(url, { useNewUrlParser: true });
    await client.connect();
    console.log('Connected to MongoDB at', url);
    db = client.db();
  }

/******************************************* 
GraphQL CODE
********************************************/  
const resolvers = {
  Query: {
    // User Service (USV) Resolvers
    getUserProfile: getUserProfileResolver,

    // Question Service (QSV) Resolvers
    getAllQuestions: getAllQuestionsResolver,
  },
  Mutation: {
    // User Service (USV) Resolvers
    signUpUser: signUpUserResolver,
    updateUserProfile: updateUserProfileResolver,
    deregisterUser: deregisterUserResolver,

    // Question Service (QSV) Resolvers
    addQuestion: addQuestionResolver,
    deleteQuestion: deleteQuestionResolver,
    updateQuestion: updateQuestionResolver,
    //Question: QuestionResolver,
  }
};

// User Service (USV) Resolvers
async function getUserProfileResolver(_, args)
{
  console.log(args)
  try {
    const { id } = args;
    console.log(id)
    console.log(1)
    const user = await db.collection('users').findOne({ id: 1 });
    // const user = await db.collection('users').findOne({ id: id });
    console.log(2)
    if (!user) {
      throw new UserInputError('User not found.');
    }
    console.log(user)
    return user;
  } catch (error) {
    throw new UserInputError(`Error getting user profile: ${error.message}`);
  }
}

async function getAllQuestionsResolver()
{
  try {
    const questions = await db.collection('questions').find().toArray();
    return questions;
  } catch (error) {
    throw new UserInputError(`Error getting questions: ${error.message}`);
  }
}

async function signUpUserResolver(_, args) 
{
  try {
    const { id, name, email, profile } = args;
    console.log( id, name, email, profile);
    // Check if the user with the provided email already exists
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }

    // Create a new user document
    const newUser = {
      id,
      name,
      email,
      profile,
     // id: await db.collection('users').countDocuments() + 1,
    };

    // Insert the new user into the "users" collection
    const result = await db.collection('users').insertOne(newUser);

    // Get the inserted user document
    const insertedUser = result.ops[0];
    console.log(insertedUser);
    return insertedUser;
  } catch (error) {
    throw new Error(`Error signing up user: ${error.message}`);
  }
};

async function updateUserProfileResolver(_, args) {
  try {
    const { id, profile } = args;
    const updatedUser = await db.collection('users').findOneAndUpdate(
      { id: id },
      { $set: { profile } },
      { returnOriginal: false }
    );
    if (!updatedUser.value) {
      throw new UserInputError('User not found.');
    }
    return updatedUser.value;
  } catch (error) {
    throw new UserInputError(`Error updating user profile: ${error.message}`);
  }
}

async function deregisterUserResolver(_, args) {
  try {
    const { id } = args;
    const result = await db.collection('users').deleteOne({ id: id });
    if (result.deletedCount === 0) {
      throw new UserInputError('User not found.');
    }
    return true;
  } catch (error) {
    throw new UserInputError(`Error deregistering user: ${error.message}`);
  }
}

// Question Service (QSV) Resolvers
async function addQuestionResolver(_, args) {
  try {
    const { title } = args;
    const newQuestion = {
      title,
      // Add any other relevant properties for your question model
    };
    const result = await db.collection('questions').insertOne(newQuestion);
    const insertedQuestion = result.ops[0];
    return insertedQuestion;
  } catch (error) {
    throw new UserInputError(`Error adding a question: ${error.message}`);
  }
}

async function deleteQuestionResolver(_, args) {
  try {
    const { questionId } = args;
    const result = await db.collection('questions').deleteOne({ id: questionId });
    if (result.deletedCount === 0) {
      throw new UserInputError('Question not found.');
    }
    return true;
  } catch (error) {
    throw new UserInputError(`Error deleting a question: ${error.message}`);
  }
}

async function updateQuestionResolver(_, args) {
  try {
    const { questionId, text } = args;
    const updatedQuestion = await db.collection('questions').findOneAndUpdate(
      { id: questionId },
      { $set: { text } },
      { returnOriginal: false }
    );
    if (!updatedQuestion.value) {
      throw new UserInputError('Question not found.');
    }
    return updatedQuestion.value;
  } catch (error) {
    throw new UserInputError(`Error updating a question: ${error.message}`);
  }
}


/******************************************* 
SERVER INITIALIZATION CODE
********************************************/
const app = express();

//Attaching a Static web server.
app.use(express.static('public')); 

//Creating and attaching a GraphQL API server.
const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});
server.applyMiddleware({ app, path: '/graphql' });

//Starting the server that runs forever.
  (async function () {
    try {
      await connectToDb();
      app.listen(3000, function () {
        console.log('App started on port 3000');
      });
    } catch (err) {
      console.log('ERROR:', err);
    }
  })();