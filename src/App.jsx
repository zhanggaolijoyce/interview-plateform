const buttonStyle = {
  backgroundColor: "#0074D9",
  color: "#ffffff",
  padding: "8px 16px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
  margin: "10px",
};

const inputStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  borderRadius: "5px",
  fontSize: "14px",
  margin: "5px",
};

async function graphQLFetch(query, variables = {}) {
  try {
    console.log(query);
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
      if (this.state.user) {
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

        const { id, name, email, profile } = this.state;
        const variables = { id, name, email, profile };

        const data = await graphQLFetch(query, variables);
        // const data = await graphQLFetch(query);
        console.log("Response data:", data);
        // this.setState({ user: data.getUserProfile });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Handle errors as needed (e.g., display an error message)
    }
  }

  handleUpdateProfile = async (profileData) => {
    // Implement logic to update user profile using the "updateUserProfile" mutation
    try {
      const mutation = `
          mutation UpdateUserProfile( $id: ID, $profile: UserProfileInput) {
            updateUserProfile(id: $id, profile: $profile) {
              id,
              name,
              email,
              profile {
                age
                location
              }
            }
          }
        `;

      const id = this.state.user.id;
      const name = this.state.user.name;
      const email = this.state.user.email;
      const { profile } = profileData;
      const variables = { id, name, email, profile };
      // console.log(variables);

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
          mutation DeregisterUser( $id: ID ) {
            deregisterUser( id: $id ) 
          }
        `;

      const id = this.state.user.id;
      const variables = { id };
      // console.log(variables);

      const data = await graphQLFetch(mutation, variables);
      const success = data.deregisterUser;
      if(success){
        this.setState({ user: null });
      } else {
        console.log("Deregister failed")
      }


      // Handle successful deregistration (e.g., show a success message)
    } catch (error) {
      console.error("Error deregistering user:", error);
      // Handle errors as needed (e.g., display an error message)
    }
  };

  handleSignUpUser = async (userData) => {
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
      console.log(this.state.user);
      const data = await graphQLFetch(signUpUserMutation, variables);
      this.setState({ user: data.signUpUser });
      // this.fetchUserProfile();

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
    console.log(user);

    if (!user) {
      return (
        <div>
          <SignUpUserForm handleSignUpUser={this.handleSignUpUser} />
        </div>
      );
    } else {
      return (
        <div>
          <UserProfileDisplay user={user} />
          <UserProfileUpdateForm onUpdateProfile={this.handleUpdateProfile} />
          <DeregisterButton onDeregister={this.handleDeregisterUser} />
        </div>
      );
    }
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
    const form = document.forms.signup;
    // Prepare user data for GraphQL call
    const userData = {
      id: form.id.value,
      name: form.name.value,
      email: form.email.value,
      profile: {
        age: form.age.value,
        location: form.location.value,
      },
    };

    // Call the provided callback function to register the user
    this.props.handleSignUpUser(userData);

    // Reset form fields
    this.setState({
      id: "",
      name: "",
      email: "",
      age: "",
      location: "",
    });
  };

  render() {
    const signUpStyle = {
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "5px",
      margin: "10px",
      backgroundColor: "#cdb4db",
    };

    return (
      <div style={signUpStyle}>
        <h2>Sign Up</h2>
        <form name="signup" onSubmit={this.handleSubmit}>
          {/* Render form input fields for user registration */}
          <div>
            <label htmlFor="id">ID:</label>
            <input type="text" name="id" placeholder="ID" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              name="name"
              placeholder="name"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              name="email"
              placeholder="email"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="age">Age:</label>
            <input
              type="text"
              name="age"
              placeholder="age"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              name="location"
              placeholder="location"
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Sign Up
          </button>
        </form>
      </div>
    );
  }
}

class UserProfileDisplay extends React.Component {
  render() {
    const { user } = this.props;

    const containerStyle = {
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "5px",
      margin: "10px",
      backgroundColor: "#bde0fe",
    };

    if (!user) {
      return <div>No user data available.</div>;
    }

    return (
      <div style={containerStyle}>
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
    const form = document.forms.update;
    const profileData = {
      profile: {
        age: form.age.value,
        location: form.location.value,
      },
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
    const updateStyle = {
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "5px",
      margin: "10px",
      backgroundColor: "#d8e2dc",
    };

    return (
      <div style={updateStyle}>
        <h2>Update User Profile</h2>
        <form name="update" onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="age">Age:</label>
            <input
              type="number"
              name="age"
              value={this.state.age}
              onChange={this.handleInputChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              name="location"
              value={this.state.location}
              onChange={this.handleInputChange}
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Update Profile
          </button>
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
    const deregisterStyle = {
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "5px",
      margin: "10px",
      backgroundColor: "#ffe5d9",
    };

    return (
      <div style={deregisterStyle}>
        <h2>Deregister User</h2>
        <button onClick={this.handleClick} style={buttonStyle}>
          Deregister User
        </button>
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
      const { id, title, description, complexity, createdBy } = this.state;
      const variables = { id, title, description, complexity, createdBy };

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

class QuestionList extends React.Component {
  render() {
    const { questions, onDeleteQuestion, onUpdateQuestion } = this.props;

    const containerStyle = {
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "5px",
      margin: "10px",
      backgroundColor: "#bde0fe",
    };

    if (questions.length === 0) {
      return <div>No questions available.</div>;
    }

    return (
      <div style={containerStyle}>
        <h2>Question List</h2>
        {questions.map((question) => (
          <div key={question.id}>
            <h3>Title: {question.title}</h3>
            <p>Description: {question.description}</p>
            <p>Complexity: {question.complexity}</p>
            {/* <p>Created By: {question.createdBy}</p> */}
            <button
              onClick={() => onDeleteQuestion(question.id)}
              style={buttonStyle}
            >
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
    const addStyle = {
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "5px",
      margin: "10px",
      backgroundColor: "#cdb4db",
    };

    return (
      <div style={addStyle}>
        <h2>Add New Question</h2>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="id">ID:</label>
            <input
              type="text"
              name="id"
              value={this.state.id}
              onChange={this.handleInputChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              name="title"
              value={this.state.title}
              onChange={this.handleInputChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              name="description"
              value={this.state.description}
              onChange={this.handleInputChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="complexity">Complexity:</label>
            <input
              type="text"
              name="complexity"
              value={this.state.complexity}
              onChange={this.handleInputChange}
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Add Question
          </button>
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
    const updateStyle = {
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "5px",
      margin: "10px",
      backgroundColor: "#d8e2dc",
    };

    return (
      <div style={updateStyle}>
        <h2>Update Question</h2>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="id">ID:</label>
            <input
              type="text"
              name="id"
              value={this.state.id}
              onChange={this.handleInputChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              name="title"
              value={this.state.title}
              onChange={this.handleInputChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              name="description"
              value={this.state.description}
              onChange={this.handleInputChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="complexity">Complexity:</label>
            <input
              type="text"
              name="complexity"
              value={this.state.complexity}
              onChange={this.handleInputChange}
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Update Question
          </button>
        </form>
      </div>
    );
  }
}

class LandingPage extends React.Component {
  render() {
    const titleStyle = {
      fontSize: "36px",
      color: "#333",
    };

    const paragraphStyle = {
      fontSize: "18px",
      color: "#666",
    };

    const emphasizedParagraphStyle = {
      fontSize: "24px",
      color: "#FF5733",
    };

    return (
      <div>
        <h1 style={titleStyle}>Welcome to the PeerPrep</h1>
        <p style={paragraphStyle}>--Exploring, Learning, and Sharing</p>
        <p style={paragraphStyle}>
          --We are here to make your interview preparation better. Explore, add,
          update, and delete questions easily with our user-friendly platform.
        </p>
        <p style={emphasizedParagraphStyle}>
          Click the buttons above to navigate to different components
        </p>
      </div>
    );
  }
}

function showLandingPage() {
  const landingComponent = <LandingPage />;
  ReactDOM.render(landingComponent, document.getElementById("contents"));
}
function showUserComponent() {
  const userComponent = <UserService />;
  ReactDOM.render(userComponent, document.getElementById("contents"));
}

function showQuestionComponent() {
  const questionComponent = <QuestionService />;
  ReactDOM.render(questionComponent, document.getElementById("contents"));
}

showLandingPage();

//ReactDOM.render(element, document.getElementById("contents"));
