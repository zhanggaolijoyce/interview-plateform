async function graphQLFetch(query, variables = {}) {
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ query, variables })
      });
      const body = await response.text();
      const result = JSON.parse(body);
      /*
      Check for errors in the GraphQL response
      */
      if (result.errors) {
        const error = result.errors[0];
        if (error.extensions.code == 'BAD_USER_INPUT') {
          const details = error.extensions.exception.errors.join('\n ');
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
    }
  
    handleSubmit = (e) => {
      e.preventDefault();
      const form = document.forms.signup;
      // Prepare user data for GraphQL call
      const userData = {
        name: form.name.value,  
        email: form.email.value,
        profile: {
          age: form.age.value,
          location: form.location.value,
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
              <label htmlFor="name">Name:</label>
              <input type="text" name="name" placeholder="Name" />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input type="text" name="email" placeholder="email" />
            </div>
            <div>
              <label htmlFor="age">Age:</label>
              <input type="text" name="age" placeholder="Age" />
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
  
    componentDidMount() {
      // Implement logic to fetch user profile data and update state using the "getUserProfile" query
    }
  
    handleUpdateProfile = (profileData) => {
      // Implement logic to update user profile using the "updateUserProfile" mutation
    }
  
    handleDeregisterUser = () => {
      // Implement logic to deregister the user using the "deregisterUser" mutation
    }
  
    handleSignUpUser = async (userData) => {
        const { name, email, profile } = userData;

        // Define the GraphQL mutation query for signing up a user
        const signUpUserMutation = `
          mutation SignUpUser($name: String!, $email: String!, $profile: UserProfileInput!) {
            signUpUser(name: $name, email: $email, profile: $profile) {
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
        const variables = {
          name,
          email,
          profile,
        };
    
        try {
          // Make the GraphQL call using the graphQLFetch function
          const data = await graphQLFetch(signUpUserMutation, variables);
    
          // Handle the response data as needed (e.g., update UI, show success message)
          console.log('User signed up:', data);
        } catch (error) {
          // Handle errors from the GraphQL call (e.g., display error message)
          console.error('Error signing up:', error);
          // Optionally, you can display an error message to the user
        }
      }
    
    
  
    render() {
      const { user } = this.state;
      
      return (
        <div>
          {/*<UserProfileDisplay user={user} />*/}
          {/*<UserProfileUpdateForm onUpdateProfile={this.handleUpdateProfile} />*/}
          {/*<DeregisterButton onDeregister={this.handleDeregisterUser} />*/}
          <SignUpUserForm handleSignUpUser={this.handleSignUpUser} />
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
  
    componentDidMount() {
      // Implement logic to fetch and display questions using the "getAllQuestions" query
    }
  
    handleAddQuestion = (questionData) => {
      // Implement logic to add a new question and update the state
    }
  
    handleDeleteQuestion = (questionId) => {
      // Implement logic to delete a question and update the state
    }
  
    handleUpdateQuestion = (questionData) => {
      // Implement logic to update a question and update the state
    }
  
    render() {
      const { questions } = this.state;
  
      return (
        <div>
          {/*<QuestionList
            questions={questions}
            onDeleteQuestion={this.handleDeleteQuestion}
            onUpdateQuestion={this.handleUpdateQuestion}
          />
          <QuestionForm onAddQuestion={this.handleAddQuestion} />
          */}
        </div>
      );
    }
  }


const element = (<><QuestionService/><UserService/></>);
ReactDOM.render(element, document.getElementById('contents'));