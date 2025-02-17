# Project Title

## Table of Contents

- [About The Project](#about-the-project)
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Contact](#contact)

<!-- ABOUT THE PROJECT -->

## About The Project

- This project is a simple Authentication API designed to demonstrate backend development skills and proficiency.
- This API is built with NestJS, a progressive Node.js framework for building efficient and scalable server-side applications. It provides a robust set of features for building RESTful APIs and microservices.
- The API is designed to handle user registration, login, and user management. It also includes features like password hashing, JWT authentication, and role-based access control.
- The API uses bullMQ for background job processing. It also uses SMTP for sending emails.
- The project is built with the following:

## Built With

- NestJS
- PassportJS
- TypeORM
- Bcrypt
- BullMQ
- Redis
- SMTP
- Json Web Tokens(JWT)
- Class Validator
- Relational Database(Postgres)

<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (Node Package Manager)
- Git

### Steps to Run Locally

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/edwinedjokpa/nest-evaluation.git
   cd your-repo
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set up Database**:

   - Create a database in Postgres
   - Create a `.env` file in the root directory and add the following variables:

   ```bash
   POSTGRES_HOST=your_postgres_host
   POSTGRES_PORT=your_postgres_port
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DB=your_postgres_db
   ```

4. **Set up Redis**:

   - Install Redis and start the Redis server.
   - Update the `REDIS_URL` in your `.env` file.
   - Run the Redis server:

   ```bash
   redis-server
   ```

   - Verify that Redis is running by running the following command:

   ```bash
   redis-cli ping
   ```

   - If the response is "PONG", Redis is running.
   - If the response is not "PONG", check your Redis configuration and ensure it's running.
   - If Redis is not running, start it using the command:

   ```bash
   redis-server
   ```

5. **Set up SMTP**:

   - Set up an SMTP server for sending emails.
   - Update the `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in your `.env` file.
   - You can use services like [Mailgun](https://www.mailgun.com/) or [SendGrid](https://sendgrid.com/) for sending emails.
   - You can also use your own SMTP server or a service like [Mailtrap](https://mailtrap.io/) for testing.

6. **Set up AWS S3**:

   - Set up an AWS S3 bucket for storing files.
   - Update the `AWS_S3_ACCESS_KEY`, `AWS_S3_SECRET_KEY`, `AWS_S3_BUCKET`, and `AWS_S3_REGION` in your `.env` file.
   - You can use the AWS Management Console to create an S3 bucket and get the necessary credentials.
   - You use services like [Amazon S3](https://aws.amazon.com/s3/) for storing files.

7. **Update Environment Variables**:

   - Create a `.env` file in the root directory and add the following variables:

   ```bash
   NODE_ENV=development
   PORT=3000
   POSTGRES_HOST=your_postgres_host
   POSTGRES_PORT=your_postgres_port
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DB=your_postgres_database
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=your_jwt_expires_in
   REDIS_URL=your_REDIS_URL
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_SECURE=your_smtp_secure
   SMTP_USER=your_smtp_user
   SMTP_PASSWORD=your_smtp_password
   SMTP_FROM=your_smtp_from
   AWS_S3_ACCESS_KEY=your_aws_access_key_id
   AWS_S3_SECRET_KEY=your_aws_secret_access_key
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET=your_aws_bucket_name
   ```

8. **Run the Application with Docker**:

   - If you want to use Docker, you can use the provided `docker-compose.yml` file to set up the necessary services.

     ```bash
     docker-compose up
     ```

   - Run migrations to create tables in the database:

     ```bash
       docker compose exec server npm run migration:docker
     ```

9. **Run the Application without Docker**:

   - Start the development server:

   ```bash
   npm run start:dev
   ```

   - Run migrations to create tables in the database:

   ```bash
   npm run migration:run
   ```

   The API will be accessible at `http://localhost:3000`.

## API Documentation

### Endpoints

- **GET /**: Returns hello world message.

- **GET /health**: Check the health of the API.

- **POST /register**: Register a new user.

- **POST /login**: Authenticate and log in a user.

- **GET /user/dashboard**: Get a user dashboard (protected route).

## Example Usage

1: Request

```bash
   curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"firstName": "John", "lastName": "Does" "email": "johndoe@email.com", "password": "password"}'
```

2: Response

```bash
{
  "success": true,
  "message": "User created successfully",
  "data":
    {
      user:
      {
        "id": "681ae256-0535-4b28-9542-77dad41e7a17",
        "firstName": "John",
        "lastName": "Doe",
        "email": "johndoe@email.com",
        "password": "$2a$10$DAmBrDM83SGfE6yf5DTRQeNiV/oRFRcYN8MxmwSJdw5wI7JQwfNiW",
        "createdAt": "2023-09-18T12:34:56.789Z",
        "updatedAt": "2023-09-18T12:34:56.789Z"
      }
    }
}
```

3: Request

```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email": "johndoe@email.com", "password": "password"}'
```

4: Response

```bash
{
  "success": true,
  "message": "User Login successful",
  "data":
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVkan9rcGFldWRpbmdAZ21haWwuY29tIiwiaWF0IjoxNjk0OTQ1MjUyLCJleHAiOjE2OTQ5NDg4NTJ9.0B7Q73q386104653360814990230920478608957"
    }
}
```

5: Request

```bash
curl -X GET http://localhost:3000/user/dashboard -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVkan9rcGFldWRpbmdAZ21haWwuY29tIiwiaWF0IjoxNjk0OTQ1MjUyLCJleHAiOjE2OTQ5NDg4NTJ9.0B7Q73q386104653360814990230920478608957"
```

6: Response

```bash
{
  success: true,
  message: "User dashboard",
  data:
    {
      user:
        {
          "id": "681ae256-0535-4b28-9542-77dad41e7a17",
          "firstName": "John",
          "lastName": "Doe",
          "email": "edjokpaedwin@gmail.com",
          "password": "$2a$10$DAmBrDM83SGfE6yf5DTRQeNiV/oRFRcYN8MxmwSJdw5wI7JQwfNiW",
          "createdAt": "2025-02-07T01:01:35.877Z",
          "updatedAt": "2025-02-07T01:01:35.877Z"
      }
    }
}
```

## Deployment

The project is deployed on [Render](https://render.com/).

<!-- CONTACT -->

## Contact

- **Edwin Edjokpa**

- **[@linkedin](https://www.linkedin.com/in/edwinedjokpa/)**

- **<edjokpaedwin@gmail.com>**

- **WhatsApp : 08137016881**
