async function graphQLFetch(query, variables = {}) {
  try {
    console.log(query)
    const response = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const body = await response.text();
    const result = JSON.parse(body);
    /*
      Check for errors in the GraphQL response
      */
    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == "BAD_USER_INPUT") {
        const details = error.extensions.exception.errors.join("\n ");
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

class SignUpUserForm extends React.Component {
  constructor() {
    super();
    this.state = {
      user: null,
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { id, name, email, age, location  } = this.state;
    // Prepare user data for GraphQL call
    const userData = {
      id,
      name,
      email,
      profile: {
        age: parseInt(age),
        location,
      },
    };

    // Call the provided callback function to register the user
    this.props.handleSignUpUser(userData);
  };

  render() {
    return (
      <div>
        <h2>Sign Up</h2>
        <form name="signup" onSubmit={this.handleSubmit}>
          {/* Render form input fields for user registration */}
          <div>
            <label htmlFor="id">ID:</label>
            <input type="text" name="id" placeholder="ID" />
          </div>
          <div>
            <label htmlFor="name">Name:</label>
            <input type="text" name="name" placeholder="name" />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input type="text" name="email" placeholder="email" />
          </div>
          <div>
            <label htmlFor="age">Age:</label>
            <input type="text" name="age" placeholder="age" />
          </div>
          <div>
            <label htmlFor="location">Location:</label>
            <input type="text" name="location" placeholder="location" />
          </div>
          <button type="submit">Sign Up</button>
        </form>
      </div>
    );
  }
}

class UserService extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null, // Initialize with an empty user object
    };
  }

  async componentDidMount() {
    // Implement logic to fetch user profile data and update state using the "getUserProfile" query
    await this.fetchUserProfile();
  }

  async fetchUserProfile() {
    try {
      const query = `
          query($id: ID, $name: String, $email: String, $profile: UserProfileInput) {
            getUserProfile(id: $id, name: $name, email: $email, profile: $profile) {
              id
              name
              email
              profile {
                age
                location
              }
            }
          }
        `;

      const  { id, name, email, profile } = this.state;
      const variables =  { id, name, email, profile };
      

      const data = await graphQLFetch(query, variables);
      // const data = await graphQLFetch(query);
      console.log("Response data:", data);
      this.setState({ user: data.getUserProfile });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Handle errors as needed (e.g., display an error message)
    }
  }

  handleUpdateProfile = async (profileData) => {
    // Implement logic to update user profile using the "updateUserProfile" mutation
    try {
      const mutation = `
          mutation UpdateUserProfile($profile: UserProfileInput) {
            updateUserProfile(profile: $profile) {
              id
              name
              email
              profile {
                age
                location
              }
            }
          }
        `;
      
      const  { id, name, email, profile } = profileData;
      const variables = { id, name, email, profile };

      const data = await graphQLFetch(mutation, variables);
      this.setState({ user: data.updateUserProfile });
      // Handle successful profile update (e.g., show a success message)
    } catch (error) {
      console.error("Error updating user profile:", error);
      // Handle errors as needed (e.g., display an error message)
    }
  };

  handleDeregisterUser = async () => {
    // Implement logic to deregister the user using the "deregisterUser" mutation
    try {
      const mutation = `
          mutation DeregisterUser($id: ID) {
            deregisterUser(id: $id) {
              id
            }
          }
        `;

      const { id, name, email, profile } = this.state;
      const variables =  { id, name, email, profile };

      const data = await graphQLFetch(mutation, variables);
      this.setState({ user: data.deregisterUser });
      // Handle successful deregistration (e.g., show a success message)
      
    } catch (error) {
      console.error("Error deregistering user:", error);
      // Handle errors as needed (e.g., display an error message)
    }
  };

  handleSignUpUser = async (userData) => {
    console.log(userData)
    const { id, name, email, profile } = userData;

    // Define the GraphQL mutation query for signing up a user
    const signUpUserMutation = `
          mutation SignUpUser($id: ID, $name: String, $email: String, $profile: UserProfileInput) {
            signUpUser(id: $id, name: $name, email: $email, profile: $profile) {
              id
              name
              email
              profile {
                age
                location
              }
            }
          }
        `;

    // Prepare the variables for the GraphQL mutation
    const variables = { id, name, email, profile };

    try {
      // Make the GraphQL call using the graphQLFetch function
      const data = await graphQLFetch(signUpUserMutation, variables);
      this.setState({ user: data.signUpUser });
      this.fetchUserProfile();

      // Handle the response data as needed (e.g., update UI, show success message)
      console.log("User signed up:", data.signUpUser);
    } catch (error) {
      // Handle errors from the GraphQL call (e.g., display error message)
      console.error("Error signing up:", error);
      // Optionally, you can display an error message to the user
    }
  };

  render() {
    const { user } = this.state;

    return (
      <div>
        <SignUpUserForm handleSignUpUser={this.handleSignUpUser} />
        <UserProfileDisplay user={user} />
        <UserProfileUpdateForm onUpdateProfile={this.handleUpdateProfile} />
        <DeregisterButton onDeregister={this.handleDeregisterUser} />
        
      </div>
    );
  }
}

class QuestionService extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [], // Initialize with an empty array of questions
    };
  }

  async componentDidMount() {
    // Implement logic to fetch and display questions using the "getAllQuestions" query
    await this.fetchAllQuestions();
  }

  async fetchAllQuestions() {
    try {
      const query = `
          query {
            getAllQuestions {
              id
              title
              description
              complexity
              createdBy {
                id
                name
                email
              }
            }
          }
        `;
      const  { id, title, description, complexity, createdBy } = this.state;
      const variables =  { id, title, description, complexity, createdBy };

      const data = await graphQLFetch(query, variables);
      this.setState({ questions: data.getAllQuestions });
    } catch (error) {
      console.error("Error fetching questions:", error);
      // Handle errors as needed (e.g., display an error message)
    }
  }

  handleAddQuestion = async (questionData) => {
    // Implement logic to add a new question and update the state
    try {
      const mutation = `
          mutation AddQuestion($title: String, $description: String, $complexity: String) {
            addQuestion(title: $title, description: $description, complexity: $complexity) {
              id
              title
              description
              complexity
            }
          }
        `;

      const { title, description, complexity } = questionData;
      const variables = { title, description, complexity };

      const data = await graphQLFetch(mutation, variables);
      this.setState((prevState) => ({
        questions: [...prevState.questions, data.addQuestion],
      }));
      // Handle successful addition (e.g., show a success message)
    } catch (error) {
      console.error("Error adding a question:", error);
      // Handle errors as needed (e.g., display an error message)
    }
  };

  handleDeleteQuestion = async (questionId) => {
    // Implement logic to delete a question and update the state
    try {
      const mutation = `
          mutation DeleteQuestion($id: ID) {
            deleteQuestion(id: $id)
          }
        `;

      const variables = { id: questionId };

      await graphQLFetch(mutation, variables);
      this.setState((prevState) => ({
        questions: prevState.questions.filter((q) => q.id == questionId),
      }));
      // Handle successful deletion (e.g., show a success message)
    } catch (error) {
      console.error("Error deleting a question:", error);
      // Handle errors as needed (e.g., display an error message)
    }
  };

  handleUpdateQuestion = async (questionData) => {
    // Implement logic to update a question and update the state
    try {
      const mutation = `
          mutation UpdateQuestion($id: ID, $title: String, $description: String, $complexity: String) {
            updateQuestion(id: $id, title: $title, description: $description, complexity: $complexity) {
              id
              title
              description
              complexity
            }
          }
        `;

      const { id, title, description, complexity } = questionData;
      const variables = { id, title, description, complexity };

      const data = await graphQLFetch(mutation, variables);
      this.setState((prevState) => ({
        questions: prevState.questions.map((q) =>
          q.id === id ? data.updateQuestion : q
        ),
      }));
      // Handle successful update (e.g., show a success message)
    } catch (error) {
      console.error("Error updating a question:", error);
      // Handle errors as needed (e.g., display an error message)
    }
  };

  render() {
    const { questions } = this.state;

    return (
      <div>
        <QuestionList
          questions={questions}
          onDeleteQuestion={this.handleDeleteQuestion}
        />
        <QuestionForm onAddQuestion={this.handleAddQuestion} />
        <UpdateQuestionForm onUpdateQuestion={this.handleUpdateQuestion} />
      </div>
    );
  }
}

class UserProfileDisplay extends React.Component {
  render() {
    const { user } = this.props;

    if (!user) {
      return <div>No user data available.</div>;
    }

    return (
      <div>
        <h2>User Profile</h2>
        <p>ID: {user.id}</p>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Age: {user.profile.age}</p>
        <p>Location: {user.profile.location}</p>
      </div>
    );
  }
}

class UserProfileUpdateForm extends React.Component {
  constructor() {
    super();
    // Initialize form state
    this.state = {
      age: "",
      location: "",
    };
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { age, location } = this.state;
    const profileData = {
      age: parseInt(age),
      location,
    };

    // Call the provided callback function to update the user's profile
    this.props.onUpdateProfile(profileData);

    // Reset form fields
    this.setState({
      age: "",
      location: "",
    });
  };

  render() {
    return (
      <div>
        <h2>Update User Profile</h2>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="age">Age:</label>
            <input
              type="number"
              name="age"
              value={this.state.age}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              name="location"
              value={this.state.location}
              onChange={this.handleInputChange}
            />
          </div>
          <button type="submit">Update Profile</button>
        </form>
      </div>
    );
  }
}

class DeregisterButton extends React.Component {
  handleClick = () => {
    // Call the provided callback function to deregister the user
    this.props.onDeregister();
  };

  render() {
    return (
      <div>
        <h2>Deregister User</h2>
        <button onClick={this.handleClick}>Deregister User</button>
      </div>
    );
  }
}

class QuestionList extends React.Component {
  render() {
    const { questions, onDeleteQuestion, onUpdateQuestion } = this.props;

    if (questions.length === 0) {
      return <div>No questions available.</div>;
    }

    return (
      <div>
        <h2>Question List</h2>
        {questions.map((question) => (
          <div key={question.id}>
            <h3>Title: {question.title}</h3>
            <p>Description: {question.description}</p>
            <p>Complexity: {question.complexity}</p>
            {/* <p>Created By: {question.createdBy}</p> */}
            <button onClick={() => onDeleteQuestion(question.id)}>
              Delete
            </button>
            {/* Add an update button and functionality here */}
          </div>
        ))}
      </div>
    );
  }
}

class QuestionForm extends React.Component {
  constructor() {
    super();
    // Initialize form state
    this.state = {
      id: "",
      title: "",
      description: "",
      complexity: "",
      // createdBy:"",
    };
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { id, title, description, complexity } = this.state;
    const questionData = {
      id,
      title,
      description,
      complexity,
    };

    // Call the provided callback function to add a new question
    this.props.onAddQuestion(questionData);

    // Reset form fields
    this.setState({
      id: "",
      title: "",
      description: "",
      complexity: "",
      // createdBy: "",
    });
  };

  render() {
    return (
      <div>
        <h2>Add New Question</h2>
        <form onSubmit={this.handleSubmit}>
        <div>
            <label htmlFor="id">ID:</label>
            <input
              type="text"
              name="id"
              value={this.state.id}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              name="title"
              value={this.state.title}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              name="description"
              value={this.state.description}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="complexity">Complexity:</label>
            <input
              type="text"
              name="complexity"
              value={this.state.complexity}
              onChange={this.handleInputChange}
            />
          </div>
          <button type="submit">Add Question</button>
        </form>
      </div>
    );
  }
}

class UpdateQuestionForm extends React.Component {
  constructor() {
    super();
    // Initialize form state
    this.state = {
      id: "",
      title: "",
      description: "",
      complexity: "",
      // createdBy:"",
    };
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { id, title, description, complexity } = this.state;
    const questionData = {
      id,
      title,
      description,
      complexity,
    };

    // Call the provided callback function to add a new question
    this.props.onAddQuestion(questionData);

    // Reset form fields
    this.setState({
      id: "",
      title: "",
      description: "",
      complexity: "",
      // createdBy: "",
    });
  };

  render() {
    return (
      <div>
        <h2>Update Question</h2>
        <form onSubmit={this.handleSubmit}>
        <div>
            <label htmlFor="id">ID:</label>
            <input
              type="text"
              name="id"
              value={this.state.id}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              name="title"
              value={this.state.title}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              name="description"
              value={this.state.description}
              onChange={this.handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="complexity">Complexity:</label>
            <input
              type="text"
              name="complexity"
              value={this.state.complexity}
              onChange={this.handleInputChange}
            />
          </div>
          <button type="submit">Update Question</button>
        </form>
      </div>
    );
  }
}


class LandingPage extends React.Component {
  render() {
    return (
      <div>
        <h1>Welcome to the PeerPrep</h1>
        <p>Click the buttons above to navigate to different components</p>
      </div>
    );
  }
}

function showLandingPage() {
  const landingComponent = <LandingPage />;
  ReactDOM.render(landingComponent, document.getElementById('contents'));
}
function showUserComponent() {
  const userComponent = <UserService />;
  ReactDOM.render(userComponent, document.getElementById('contents'));
}

function showQuestionComponent() {
  const questionComponent = <QuestionService />;
  ReactDOM.render(questionComponent, document.getElementById('contents'));
}


showLandingPage();

//ReactDOM.render(element, document.getElementById("contents"));
