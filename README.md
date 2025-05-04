## Firebase Integration

This project uses Firebase for both authentication and data storage. Follow these steps to set up Firebase for your application:

### Firebase Authentication Setup

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup steps
3. Give your project a name and click "Continue"
4. You can enable or disable Google Analytics based on your preference
5. Click "Create project"

### 2. Enable Email/Password Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click on the "Sign-in method" tab
3. Click on "Email/Password" in the list of providers
4. Toggle the "Enable" switch to enable Email/Password authentication
5. Click "Save"

### 3. Register Your Web App

1. In your Firebase project console, click on the gear icon next to "Project Overview" and select "Project settings"
2. Scroll down to the "Your apps" section and click on the web icon (</>) to add a web app
3. Give your app a nickname and click "Register app"
4. Firebase will generate configuration code for your app

### 4. Update Firebase Configuration

1. Copy the Firebase configuration object from the Firebase console
2. Open the file `src/lib/firebase.ts` in your project
3. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
 apiKey: "AIzaSyCaZ_jcuCAuoDYGLW0qVbfZZdzlwMasLqY",
  authDomain: "sike-rentals.firebaseapp.com",
  projectId: "sike-rentals",
  storageBucket: "sike-rentals.firebasestorage.app",
  messagingSenderId: "719709432653",
  appId: "1:719709432653:web:f0e0d209ab2216c4fbe504"
  // measurementId is optional and only needed if you've enabled Google Analytics
  // measurementId: "G-XXXXXXXXXX"
};
```

**Note:** The `measurementId` field is optional and only required if you've enabled Google Analytics for your Firebase project. If you don't have a measurementId in your Firebase configuration, you can simply omit that field.

### 5. Email Verification

This application encourages but does not require email verification. Here's how it works:

1. When a user registers, a verification email is sent to their email address
2. Users can sign in even if their email is not verified
3. Users can access all features of the application without verifying their email
4. If a user signs in with an unverified email, they'll see a warning message (this is just informational and doesn't affect functionality)
5. Users can still verify their email by clicking the verification link in the email if they choose to
6. Users can request a new verification email if needed

**Important:** Email verification is completely optional and won't prevent users from accessing any part of the application. The application has been configured to allow full access regardless of verification status.

**Note:** In a development environment, Firebase verification emails might be sent to your spam folder. Be sure to check there if you don't see the verification email in your inbox.

**For Testing:** If you've created a user directly in the Firebase Authentication console, you can sign in with that user even if the email is not verified, and you'll have full access to all features.

### 6. Test Authentication

1. Start your development server with `npm run dev`
2. Navigate to the sign-up page and create a new account
3. Check your email (including spam folder) for a verification link
4. Click the verification link to verify your email
5. Sign in with your credentials

### Firebase Firestore Setup

This application uses Firebase Firestore for data storage, which means your data is stored in the cloud and accessible from any device when you sign in. Follow these steps to set up Firestore for your application:

#### 1. Enable Firestore in Your Firebase Project

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose either "Start in production mode" or "Start in test mode" (for development, test mode is easier as it allows all reads and writes)
4. Select a location for your Firestore database (choose the region closest to your users)
5. Click "Enable"

#### 2. Understanding Firestore Integration

The application has been updated to use Firestore instead of localStorage for data storage, with a **shared data model** where all authenticated users can access the same data. This provides several benefits:

- **Data Persistence**: Your data is stored in the cloud and persists across browser sessions and devices
- **Real-time Updates**: Changes to the data are automatically synchronized across all connected clients
- **Offline Support**: Firestore caches data locally, allowing the application to work offline
- **Scalability**: Firestore can handle large amounts of data and high traffic
- **Security**: Data access can be controlled with Firestore security rules
- **Multi-User Access**: All authenticated users can access and modify the same data
- **Centralized Administration**: Perfect for controlled platforms with limited admin access

All data (vehicles, customers, rentals, etc.) is now stored in shared Firestore collections (not user-specific) and automatically synchronized with the application state. This means that any authenticated user can see and modify all data in the system, making it ideal for a controlled platform with limited admin access.

#### 3. Set Up Firestore Security Rules for Admin Access

Since this application is designed for a controlled platform with limited admin access, you should set up security rules to restrict access to authenticated users with admin roles:

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click on the "Rules" tab
3. Update the rules to restrict access to authenticated users with admin roles:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Function to check if the user is an admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Admin collection - only admins can read the list, but no one can write
    match /admins/{userId} {
      allow read: if isAdmin();
      allow write: if false; // Admins should be managed via Firebase console
    }
    
    // All other collections - only admins can read and write
    match /{collection}/{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

These rules restrict access to users who are listed in the `admins` collection. To set up admin users:

1. Create an `admins` collection in Firestore
2. For each admin user, create a document with the user's UID as the document ID
3. The document can be empty or contain additional admin metadata

This ensures that only designated admin users can access and modify the data in your application.

#### 4. Migrating from User-Specific to Shared Collections

If you were previously using the application with user-specific collections (`users/{userId}/{collectionName}`), you'll need to migrate your data to the new shared collections:

1. **Export existing data**: 
   - In the Firebase console, go to Project Settings > Service accounts
   - Generate a new private key for the Firebase Admin SDK
   - Use the Firebase Admin SDK to export your data from the user-specific collections

2. **Import to shared collections**:
   - Transform the data to remove user-specific paths
   - Import the transformed data to the shared collections

3. **Update security rules**:
   - Apply the admin-only security rules as described above

For a small amount of data, you can also manually copy data from the user-specific collections to the shared collections using the Firebase console.

#### 4. Test Firestore Integration

1. Sign in to the application
2. Add a new customer or vehicle
3. Sign out and sign in again (or use a different device/browser)
4. Verify that your data is still available

Your data is now stored in Firestore and will be available whenever you sign in, regardless of the device or browser you use.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSSS