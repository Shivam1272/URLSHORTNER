
# URL Shortener

This is a URL shortener application built using Node.js and Express. It allows users to shorten long URLs and manage their shortened links in a user-friendly dashboard.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)

## Features

- User registration and login system.
- URL shortening with customizable short URLs.
- User-specific dashboard to manage shortened URLs.
- Integration with a MongoDB database for data storage.
- Secure authentication with password hashing.

## Getting Started

To get started with this project, follow the instructions below.

### Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (with npm)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Shivam1272/URLSHORTNER.git
   cd URLSHORTNER
   
2.  Create a .env file   
    ```bash
     DB_CONNECTION_STRING=mongodb://localhost/url-shortener
     SESSION_SECRET=your_session_secret_here

3.  Start the application:
    ```bash
    npm start

4. Access the application in your web browser at http://localhost:3000.

### Usage

- Register for an account on the registration page.
- Log in to your account on the login page.
- Use the das#hboard to shorten long URLs and manage your shortened links.
- Log out when finished.
