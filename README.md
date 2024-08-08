# CRM Tool

## Overview
This is a basic CRM tool prototype that allows users to add, view, edit, and manage leads. The tool uses a simple backend server for data persistence and provides a user interface for managing lead data.

## Features
- Add new leads with name, email, phone number, and status.
- View leads in a paginated table format.
- Edit or delete leads.
- Search and filter leads by name, email, or status.
- Data is persisted between sessions using a backend server.

## Technologies
- HTML
- CSS
- Javascript
- NodeJs
- Express

## Setup Instructions

1. **Clone the Repository:**

   git clone <repository-url>
   cd crm-tool

2. **Install Dependencies:**

   - **Backend**:
     - Navigate to the `server` directory.
     - Install dependencies:
       npm install

   - **Frontend**:
     - Navigate to the `client` directory.
     - Ensure you have a modern browser to view the HTML/CSS/JS files.


3. **Start the Backend Server:**

  npm run start


4. **Open the CRM Tool:**
Open your browser and navigate to http://localhost:3000 to use the CRM tool.



### Limitations
Data is stored in a local JSON file, which may not be ideal for production use.
No user authentication or advanced data validation is implemented.

### Future Improvements
Integrate a database for better data persistence.
Implement user authentication and role-based access.



### Additional Notes

- **Security:** For production, consider adding security measures like input data sanitization, and user authentication.

This setup provides a functional CRM tool with basic lead management features, data persistence, and a clean user interface.
