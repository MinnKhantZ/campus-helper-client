# Campus Helper 📱

A comprehensive mobile application designed to enhance campus life for students, providing tools for event management, club activities, marketplace interactions, and campus navigation.

![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue)
![Expo](https://img.shields.io/badge/Expo-53.0.22-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

## ✨ Features

### 📅 Event Management
- **Browse Events**: View upcoming campus events with detailed information
- **Add Events**: Create and manage campus events (admin/staff only)
- **Event Details**: Comprehensive event information with date, time, location, and description
- **Real-time Updates**: Stay updated with latest event announcements

### 🏛️ Club Activities
- **Club Directory**: Browse all campus clubs and organizations
- **Club Information**: Detailed club profiles with members, activities, and contact info
- **Club Chat**: Real-time messaging within club communities
- **Club Management**: Create and manage clubs (admin/staff only)
- **Join Clubs**: Connect with like-minded students

### 🛒 Campus Marketplace
- **Buy & Sell**: Student-to-student marketplace for books, electronics, furniture, etc.
- **Product Listings**: Detailed product information with images and pricing
- **Market Categories**: Organized product categories for easy browsing
- **Secure Transactions**: Safe buying and selling within campus community

### 🗺️ Campus Navigation
- **Interactive Map**: Navigate campus facilities and landmarks
- **Location Markers**: Important campus locations marked on map
- **Real-time Location**: GPS-based navigation assistance

### 📊 Timetable Management
- **Class Schedule**: View and manage academic timetable
- **Schedule Integration**: Sync with campus academic calendar
- **Reminders**: Get notifications for upcoming classes

### 🔐 Authentication & Security
- **Secure Login**: JWT-based authentication system
- **Role-based Access**: Different permissions for students, staff, and admins
- **Profile Management**: User profile with personal information
- **Session Management**: Persistent login sessions with secure storage

### 🔔 Notifications
- **Push Notifications**: Real-time notifications for events, messages, and updates
- **Event Reminders**: Automatic reminders for upcoming events
- **Message Alerts**: Instant notifications for club messages

## 🛠️ Tech Stack

- **Framework**: React Native 0.79.5 with Expo SDK 53
- **Language**: TypeScript 5 for type safety
- **State Management**: Redux Toolkit for predictable state
- **Navigation**: React Navigation (Stack, Tab, Drawer navigators)
- **UI Components**: React Native Paper for Material Design
- **Maps**: React Native Maps for campus navigation
- **HTTP Client**: RTK Query for API state management
- **Storage**: AsyncStorage for local data persistence
- **Notifications**: Expo Notifications for push notifications
- **Image Handling**: Expo Image Picker for photo uploads
- **Icons**: Material Community Icons

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18 or higher
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Backend Server**: Campus Helper Backend running

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd campus-helper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create `.env` file in the root directory:

```env
# Backend API URL
API_BASE_URL=http://localhost:3000/api

# Or for production
API_BASE_URL=https://your-backend-url.com/api
```

### 4. Start Development Server

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `a` to open Android emulator
- Press `i` to open iOS simulator
- Scan QR code with Expo Go app on your phone

## 📁 Project Structure

```
campus-helper/
├── app.json                    # Expo configuration
├── App.tsx                     # Main app component with providers
├── app/                        # Main application code
│   ├── Navigation.tsx          # App navigation structure
│   ├── store.ts               # Redux store configuration
│   ├── api/                   # API integration layer
│   │   ├── baseQuery.ts       # Base API configuration
│   │   ├── BaseUrl.ts         # API base URL configuration
│   │   ├── Auth.ts            # Authentication API
│   │   ├── User.ts            # User management API
│   │   ├── Event.ts           # Event management API
│   │   ├── Club.ts            # Club management API
│   │   ├── Marketplace.ts     # Marketplace API
│   │   ├── Message.ts         # Messaging API
│   │   └── uploadImage.ts     # Image upload API
│   ├── components/            # Reusable UI components
│   │   ├── CampusMarker.tsx   # Map marker component
│   │   ├── EventCard.tsx      # Event card display
│   │   ├── EventList.tsx      # Event list component
│   │   └── ScreenHeader.tsx   # Screen header component
│   ├── constants/             # App constants
│   │   └── Colors.ts          # Color theme definitions
│   ├── features/              # Redux slices
│   │   └── authSlice.ts       # Authentication state
│   ├── hooks/                 # Custom React hooks
│   │   └── useNotiSetup.ts    # Notification setup hook
│   ├── screens/               # App screens/pages
│   │   ├── LoginScreen.tsx    # User authentication
│   │   ├── EventsScreen.tsx   # Event browsing
│   │   ├── EventAddScreen.tsx # Add new events
│   │   ├── ClubsScreen.tsx    # Club directory
│   │   ├── ClubInfoScreen.tsx # Club details
│   │   ├── ClubFormScreen.tsx # Create/edit clubs
│   │   ├── ClubChatScreen.tsx # Club messaging
│   │   ├── MarketplaceScreen.tsx # Marketplace browsing
│   │   ├── MarketDetailScreen.tsx # Product details
│   │   ├── MarketFormScreen.tsx # Add/edit products
│   │   ├── MapScreen.tsx      # Campus map
│   │   └── TimeTableScreen.tsx # Academic timetable
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── assets/                    # Static assets (images, icons)
├── node_modules/              # Dependencies
└── package.json               # Project dependencies and scripts
```

## 🗄️ Data Models

### Core Entities

- **User**: Student/staff accounts with role-based access
- **Event**: Campus events with scheduling and details
- **Club**: Student organizations and activities
- **MarketplaceItem**: Products for sale in campus marketplace
- **Message**: Chat messages within clubs
- **Timetable**: Academic class schedules

### API Integration

The app uses RTK Query for efficient API state management:

- **Authentication**: Login/logout with JWT tokens
- **Events**: CRUD operations for campus events
- **Clubs**: Club management and membership
- **Marketplace**: Product listings and transactions
- **Messages**: Real-time club communication
- **File Upload**: Image uploads for profiles and products

## 🔐 Authentication Flow

### User Roles

- `STUDENT`: Standard user with basic access
- `STAFF`: Can create events and manage clubs
- `ADMIN`: Full system access and management

### Login Process

1. User enters credentials on LoginScreen
2. API call to `/api/auth/login`
3. JWT token stored in AsyncStorage
4. User data loaded into Redux store
5. Navigation switches to main app

### Protected Routes

- Event creation (Staff/Admin only)
- Club management (Staff/Admin only)
- Admin features (Admin only)

## 📡 API Endpoints

### Authentication

```typescript
POST   /api/auth/login          // User login
POST   /api/auth/register       // User registration
GET    /api/auth/me            // Get current user
```

### Events

```typescript
GET    /api/events             // List events
POST   /api/events             // Create event (Staff/Admin)
GET    /api/events/:id         // Get event details
PUT    /api/events/:id         // Update event (Staff/Admin)
DELETE /api/events/:id         // Delete event (Staff/Admin)
```

### Clubs

```typescript
GET    /api/clubs              // List clubs
POST   /api/clubs              // Create club (Staff/Admin)
GET    /api/clubs/:id          // Get club details
PUT    /api/clubs/:id          // Update club (Staff/Admin)
DELETE /api/clubs/:id          // Delete club (Staff/Admin)
```

### Marketplace

```typescript
GET    /api/marketplace        // List products
POST   /api/marketplace        // Create product
GET    /api/marketplace/:id    // Get product details
PUT    /api/marketplace/:id    // Update product
DELETE /api/marketplace/:id    // Delete product
```

### Messages

```typescript
GET    /api/messages/:clubId   // Get club messages
POST   /api/messages           // Send message
```

## 🎨 UI/UX Design

### Material Design

The app follows Material Design principles using React Native Paper:

- **Colors**: Blue primary theme with consistent color palette
- **Typography**: Clear hierarchy with readable fonts
- **Navigation**: Intuitive bottom tabs and drawer navigation
- **Components**: Consistent card layouts and form designs

### Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: iOS tablet compatibility
- **Orientation**: Portrait mode optimized

## 🚀 Deployment

### Build for Production

```bash
# Build for Android APK
npx expo build:android

# Build for iOS
npx expo build:ios

# Build for web (PWA)
npx expo build:web
```

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g @eas/cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for platforms
eas build --platform android
eas build --platform ios
```

### Environment Variables for Production

Ensure these are set in your build configuration:

- `API_BASE_URL`: Your production backend URL
- `EXPO_PUBLIC_*`: Public environment variables

## 🧪 Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
npm run typecheck  # Run TypeScript type checking
```

### Development Tools

- **Expo Go**: Test on physical devices
- **React Native Debugger**: Debug Redux state and network
- **Flipper**: Advanced debugging and inspection

## 📊 Performance Optimizations

- **RTK Query**: Efficient API caching and state management
- **Image Optimization**: Expo Image component for fast loading
- **Lazy Loading**: Screens loaded on demand
- **Memoization**: React.memo for expensive components

## 🛡️ Security Best Practices

- JWT token-based authentication
- Secure storage with AsyncStorage encryption
- Input validation on forms
- API request/response sanitization
- Role-based access control

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
npx expo install --fix
```

**Android build fails:**
- Ensure Android SDK is properly configured
- Check Java version compatibility

**iOS build fails:**
- Ensure Xcode is up to date
- Check iOS deployment target

**API connection issues:**
- Verify backend server is running
- Check API_BASE_URL configuration
- Ensure CORS is properly configured on backend

## 📞 Support

For help and questions:
- Open an [Issue](https://github.com/your-repo/issues)
- Check the [Wiki](https://github.com/your-repo/wiki) for guides

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Native community for excellent documentation
- Material Design for UI/UX inspiration

---

**Built with ❤️ for better campus life**
