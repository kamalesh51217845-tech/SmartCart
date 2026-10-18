# SmartCart – Full-Stack E-Commerce Web Application

SmartCart is a full-stack e-commerce web application developed using React.js, Django REST Framework, and MySQL. It provides a user-friendly shopping experience with product browsing, search, cart management, user authentication, checkout, and order history.

This project demonstrates full-stack development, REST API integration, database management, and frontend-backend communication.

## Features

- **Product Browsing:** View and explore available products.
- **Product Search:** Search for products by name.
- **Product Details:** View individual product information.
- **Shopping Cart:** Add products and manage cart items.
- **User Authentication:** Register and log in to an account.
- **Checkout:** Proceed through the checkout workflow.
- **Order History:** View previous orders.
- **Admin Dashboard:** Manage and monitor store information.
- **REST API Integration:** Connect the React frontend to the Django backend.
- **MySQL Database:** Store and manage application data.

## Technology Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Backend
- Python
- Django
- Django REST Framework

### Database
- MySQL

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Postman (for API testing)

## Project Structure

```text
SmartCart/
├── backend/
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── ...
│   ├── store/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── migrations/
│   └── manage.py
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Python
- Node.js and npm
- MySQL Server
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/SmartCart.git
cd SmartCart
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Set Up the MySQL Database

Open MySQL Workbench or your MySQL terminal and create the database:

```sql
CREATE DATABASE smartcart_db;
```

Configure your database name, username, password, host, and port in the Django settings or environment variables according to your project configuration.

### 3. Set Up the Django Backend

Open a terminal in the project root:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```bash
pip install django djangorestframework mysqlclient
```

If your project uses additional packages, install those too. If you have a `requirements.txt` file, use:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend usually runs at:

`http://127.0.0.1:8000/`

### 4. Set Up the React Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal, commonly:

`http://localhost:5173/`

Ensure the frontend API base URL points to your running Django backend.

## API Integration

The React frontend communicates with the Django REST Framework backend through HTTP requests.

Typical API functionality may include:

- Retrieving products
- Registering and authenticating users
- Managing cart and checkout operations
- Retrieving order history
- Accessing administrative features

The exact API endpoints depend on the routes configured in the backend.

## Database

SmartCart uses MySQL as its relational database. Django models define the application's data structures, and Django migrations manage database schema changes.

## Security Notes

- Never commit `.env` files, database passwords, or production secret keys.
- Use environment variables for sensitive configuration.
- Apply appropriate authentication and permissions to protected APIs.
- Use HTTPS and production-ready settings when deploying.

## Future Enhancements

- Online payment gateway integration
- Product categories and filtering
- Product ratings and reviews
- Wishlist functionality
- Order tracking
- Deployment to a production hosting platform

## Learning Outcomes

This project provides practical experience in:

- Building a React-based user interface
- Developing REST APIs with Django REST Framework
- Connecting a backend application to MySQL
- Integrating frontend and backend services
- Managing code with Git and GitHub

## Author

**SmartCart Project**

A full-stack e-commerce application developed for learning, practical experience, and portfolio demonstration.

## License

This project is intended for educational and portfolio purposes. Add a specific open-source license if you want others to reuse or distribute your code under defined terms.
