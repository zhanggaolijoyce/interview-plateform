// initmongo.js

//To execute:
//$mongo assignment3db initmongo.js 
//Above command to be executed from the directory where initmongo.js is present

//Perform a cleanup of existing data. 
db.dropDatabase()

// Create a collection for User Service (USV)
db.createCollection("users")
// Optionally, you can define indexes or validations for the "users" collection here

// Insert a sample user with an "id" field
db.users.insert({
  id: 1, // Unique ID for the user
  name: "John Doe",
  email: "johndoe@example.com",
  profile: {
    age: 30,
    location: "New York",
  }
})

// Create a collection for Question Service (QSV)
db.createCollection("questions")
// Optionally, you can define indexes or validations for the "questions" collection here

// Insert a sample question with an "id" field
db.questions.insert({
  id: 1, // Unique ID for the question
  title: "Sample Question",
  content: "This is a sample interview question.",
  postedBy: "John Doe",
  tags: ["interview", "sample"],
})
