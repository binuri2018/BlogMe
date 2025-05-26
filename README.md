# Blog Me - A Modern Blogging Platform

![Blog Me](https://img.shields.io/badge/Blog-Me-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.7.0-orange)
![License](https://img.shields.io/badge/License-MIT-green)

A modern, responsive blogging platform built with React and Firebase, offering a seamless experience for both writers and readers. Blog Me combines elegant design with powerful features to create an engaging blogging environment.

## ✨ Features

### For Writers
- 📝 Create, edit, and delete blog posts with rich text formatting
- 🖼️ Upload and manage blog images
- 📊 Track blog statistics and view counts
- 👤 Customizable user profiles with bio and location
- 🌐 Multi-language support for user profiles
- 🔒 Secure authentication and authorization

### For Readers
- 🔍 Browse blogs by categories
- 👥 View author profiles and their other posts
- 💬 Interactive user interface
- 📱 Fully responsive design for all devices
- ⚡ Fast and smooth user experience

### Technical Features
- 🔐 Firebase Authentication for secure user management
- 📦 Firestore Database for real-time data storage
- 🎨 Modern UI with Material Design principles
- 📱 Responsive design for all screen sizes
- ⚡ Optimized performance
- 🔒 Form validation and error handling
- 🎯 SEO-friendly structure

## 🚀 Getting Started

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm 
- Firebase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/binuri2018/blog-me.git
cd blog-me
```

2. Install dependencies
```bash
npm install
```

3. Create a Firebase project and enable:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage (for blog images)

4. Create a `src/firebase.js` file in the root directory and add your Firebase configuration:
```src/firebase.js
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

5. Start the development server
```bash
npm start
```

## 🛠️ Built With

- [React](https://reactjs.org/) - Frontend framework
- [Firebase](https://firebase.google.com/) - Backend and authentication
- [React Router](https://reactrouter.com/) - Routing
- [Font Awesome](https://fontawesome.com/) - Icons
- [Google Fonts](https://fonts.google.com/) - Typography

## 📱 Features in Detail

### User Authentication
- Secure email/password authentication
- Protected routes for authenticated users
- User profile management
- Session persistence

### Blog Management
- Create and edit blog posts
- Rich text formatting
- Image upload and management
- Category organization
- View count tracking

### User Profiles
- Customizable profile information
- Bio and location details
- Language preferences
- Profile statistics
- Blog post history

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interface
- Optimized for all devices

## 🔒 Security Features

- Form validation
- Input sanitization
- Protected routes
- Secure authentication
- Data encryption
- Error handling

## 🎨 UI/UX Features

- Clean and modern design
- Intuitive navigation
- Responsive layouts
- Loading states
- Error feedback
- Smooth animations
- Consistent styling

## 📦 Project Structure

```
blog-me/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/
│   │   ├── Navbar/
│   │   └── ...
│   ├── pages/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Profile/
│   │   └── ...
│   ├── firebase/
│   │   └── config.js
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## 👥 Authors

- Binuri Manodya - Initial work - (https://github.com/binuri2018)

## 🙏 Acknowledgments

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Material Design](https://material.io/design)
- [Font Awesome](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
